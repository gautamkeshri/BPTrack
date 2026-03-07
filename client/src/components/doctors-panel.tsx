import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Send, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/config";
import { getSessionToken } from "@/lib/api";

interface DoctorsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Grant {
  id: string;
  status: "pending" | "approved" | "revoked";
  createdAt: number;
  doctorName: string;
  doctorCode: string;
}

interface DoctorLookup {
  id: string;
  name: string;
  doctorId: string;
}

async function fetchJson(url: string) {
  const token = getSessionToken();
  const res = await fetch(getApiUrl(url), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
  return json?.data ?? json;
}

const STATUS_CONFIG = {
  pending:  { label: "Pending",  icon: Clock,         className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  approved: { label: "Approved", icon: CheckCircle,    className: "bg-green-100 text-green-700 border-green-200" },
  revoked:  { label: "Revoked",  icon: XCircle,        className: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function DoctorsPanel({ isOpen, onClose }: DoctorsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [codeInput, setCodeInput] = useState("");
  const [lookedUp, setLookedUp] = useState<DoctorLookup | null>(null);
  const [lookupError, setLookupError] = useState("");

  const { data: grants = [], isLoading } = useQuery<Grant[]>({
    queryKey: ["/api/access-requests"],
    queryFn: () => fetchJson("/api/access-requests"),
    enabled: isOpen,
  });

  const lookup = useMutation({
    mutationFn: (code: string) => fetchJson(`/api/access-requests/lookup?code=${encodeURIComponent(code)}`),
    onSuccess: (data: DoctorLookup) => {
      setLookedUp(data);
      setLookupError("");
    },
    onError: (err: Error) => {
      setLookedUp(null);
      setLookupError(err.message);
    },
  });

  const sendRequest = useMutation({
    mutationFn: (doctorCode: string) =>
      apiRequest("POST", "/api/access-requests", { doctorCode }).then((r) => r.json()),
    onSuccess: (json: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/access-requests"] });
      toast({ title: "Request sent", description: json?.data?.message ?? "Access request sent to doctor." });
      setLookedUp(null);
      setCodeInput("");
    },
    onError: (err: Error) => {
      toast({ title: "Failed to send request", description: err.message, variant: "destructive" });
    },
  });

  const handleLookup = () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    lookup.mutate(code);
  };

  const handleSend = () => {
    if (!lookedUp) return;
    sendRequest.mutate(lookedUp.doctorId);
  };

  const alreadySent = (doctorCode: string) =>
    grants.some((g) => g.doctorCode === doctorCode && g.status !== "revoked");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-4 space-y-5 max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-slate-900">My Doctors</h2>
          <div className="w-9" />
        </div>

        {/* Look up a doctor */}
        <div className="space-y-3 flex-shrink-0">
          <p className="text-sm text-slate-500">
            Enter your doctor's ID (e.g. <span className="font-mono font-medium text-slate-700">DR-SM0001</span>) to send them an access request.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="DR-XXXXXX"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setLookedUp(null); setLookupError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="font-mono tracking-widest uppercase"
              maxLength={9}
            />
            <Button
              onClick={handleLookup}
              disabled={!codeInput.trim() || lookup.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Search className="h-4 w-4" />
              {lookup.isPending ? "..." : "Look up"}
            </Button>
          </div>

          {/* Lookup result */}
          {lookedUp && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900">{lookedUp.name}</div>
                  <div className="text-xs font-mono text-slate-500">{lookedUp.doctorId}</div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={sendRequest.isPending || alreadySent(lookedUp.doctorId)}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
              >
                <Send className="h-3.5 w-3.5" />
                {alreadySent(lookedUp.doctorId) ? "Sent" : sendRequest.isPending ? "Sending…" : "Send Request"}
              </Button>
            </div>
          )}

          {/* Lookup error */}
          {lookupError && (
            <p className="text-sm text-red-600">{lookupError}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 flex-shrink-0" />

        {/* Existing grants */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          <h3 className="text-sm font-medium text-slate-700">Access requests</h3>
          {isLoading ? (
            <p className="text-sm text-slate-400 py-4 text-center">Loading…</p>
          ) : grants.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No requests yet.</p>
          ) : (
            grants.map((grant) => {
              const cfg = STATUS_CONFIG[grant.status] ?? STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <div key={grant.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">{grant.doctorName}</div>
                    <div className="text-xs font-mono text-slate-400">{grant.doctorCode}</div>
                  </div>
                  <Badge variant="outline" className={`gap-1 text-xs ${cfg.className}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
