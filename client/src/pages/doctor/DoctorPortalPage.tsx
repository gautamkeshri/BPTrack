import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Copy, Check, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { getApiUrl } from "@/config";
import { getSessionToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  readingDate: string | number;
  classification: string;
  pulseStressure: number;
  meanArterialPressure: number;
  notes?: string | null;
}

interface IncomingRequest {
  id: string;
  status: "pending" | "approved" | "revoked";
  createdAt: number;
  patientId: string;
  patientName: string;
  patientEmail: string;
}

const STATUS_CONFIG = {
  pending:  { label: "Pending",  icon: Clock,         className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  approved: { label: "Approved", icon: CheckCircle,    className: "bg-green-100 text-green-700 border-green-200" },
  revoked:  { label: "Revoked",  icon: XCircle,        className: "bg-slate-100 text-slate-500 border-slate-200" },
};

const CLASSIFICATION_COLOR: Record<string, string> = {
  "Normal": "bg-green-100 text-green-700 border-green-200",
  "Elevated": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Hypertension Stage 1": "bg-orange-100 text-orange-700 border-orange-200",
  "Hypertension Stage 2": "bg-red-100 text-red-700 border-red-200",
  "Hypertensive Crisis": "bg-red-200 text-red-900 border-red-400",
};

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

export default function DoctorPortalPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);

  const { data: requests = [], isLoading } = useQuery<IncomingRequest[]>({
    queryKey: ["/api/access-requests/incoming"],
    queryFn: () => fetchJson("/api/access-requests/incoming"),
  });

  const updateGrant = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "revoked" }) => {
      const token = getSessionToken();
      return fetch(getApiUrl(`/api/access-requests/${id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      }).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
        return json;
      });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/access-requests/incoming"] });
      toast({ title: status === "approved" ? "Access approved" : "Access revoked" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  const { data: patientReadings = [], isLoading: isLoadingReadings } = useQuery<BPReading[]>({
    queryKey: ["/api/access-requests", selectedPatient?.id, "readings"],
    queryFn: () => fetchJson(`/api/access-requests/${selectedPatient!.id}/readings`),
    enabled: !!selectedPatient,
  });

  const handleCopy = () => {
    if (!user?.doctorId) return;
    navigator.clipboard.writeText(user.doctorId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">BPTrack</h1>
            <p className="text-xs text-slate-500">Doctor Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user?.name ?? user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Doctor ID Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-700">Your Doctor ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Share this ID with your patients. They enter it in BPTrack to send
              you an access request, letting you view their blood pressure history.
            </p>
            {user?.doctorId ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-5 py-3">
                  <span className="text-2xl font-mono font-bold tracking-widest text-blue-700">
                    {user.doctorId}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2 min-w-[90px]"
                >
                  {copied ? (
                    <><Check className="h-4 w-4 text-green-600" /> Copied</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Copy</>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No Doctor ID assigned — contact support.</p>
            )}
          </CardContent>
        </Card>

        {/* Incoming Access Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-700">Patient Access Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
            ) : requests.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No access requests yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <div key={req.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                      <div>
                        <div className="font-medium text-slate-900">{req.patientName}</div>
                        <div className="text-xs text-slate-400">{req.patientEmail}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`gap-1 text-xs ${cfg.className}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                        {req.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-2"
                              disabled={updateGrant.isPending}
                              onClick={() => updateGrant.mutate({ id: req.id, status: "approved" })}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs px-2"
                              disabled={updateGrant.isPending}
                              onClick={() => updateGrant.mutate({ id: req.id, status: "revoked" })}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {req.status === "approved" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2 gap-1"
                              onClick={() => setSelectedPatient(
                                selectedPatient?.id === req.patientId ? null : { id: req.patientId, name: req.patientName }
                              )}
                            >
                              <FileText className="h-3 w-3" />
                              {selectedPatient?.id === req.patientId ? "Close" : "View Log"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs px-2"
                              disabled={updateGrant.isPending}
                              onClick={() => updateGrant.mutate({ id: req.id, status: "revoked" })}
                            >
                              Revoke
                            </Button>
                          </>
                        )}
                        {req.status === "revoked" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            disabled={updateGrant.isPending}
                            onClick={() => updateGrant.mutate({ id: req.id, status: "approved" })}
                          >
                            Re-approve
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient BP Log (shown when a patient is selected) */}
        {selectedPatient && (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-slate-700">
                {selectedPatient.name}'s BP Log
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                <XCircle className="h-4 w-4 text-slate-400" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingReadings ? (
                <p className="text-sm text-slate-400 py-6 text-center">Loading readings…</p>
              ) : patientReadings.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No readings recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                        <th className="pb-2 pr-4">Date</th>
                        <th className="pb-2 pr-4">Sys</th>
                        <th className="pb-2 pr-4">Dia</th>
                        <th className="pb-2 pr-4">Pulse</th>
                        <th className="pb-2">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patientReadings.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-2 pr-4 text-slate-600 whitespace-nowrap">
                            {format(new Date(r.readingDate), "dd-MM-yyyy HH:mm")}
                          </td>
                          <td className="py-2 pr-4 font-medium text-slate-900">{r.systolic}</td>
                          <td className="py-2 pr-4 font-medium text-slate-900">{r.diastolic}</td>
                          <td className="py-2 pr-4 text-slate-700">{r.pulse}</td>
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${CLASSIFICATION_COLOR[r.classification] ?? "bg-slate-100 text-slate-600"}`}
                            >
                              {r.classification}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-400 mt-3">{patientReadings.length} readings — read-only view</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
