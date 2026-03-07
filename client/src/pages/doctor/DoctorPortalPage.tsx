import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Stethoscope, Copy, Check } from "lucide-react";

export default function DoctorPortalPage() {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

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

        {/* Patient Management — coming soon */}
        <Card className="text-center py-14">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-slate-900">Patient Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 max-w-sm mx-auto">
              Incoming access requests and clinical BP review features are coming
              soon.
            </p>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
