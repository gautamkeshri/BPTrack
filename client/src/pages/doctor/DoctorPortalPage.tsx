import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Stethoscope } from "lucide-react";

export default function DoctorPortalPage() {
  const { user, logout } = useAuth();

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
            Dr. {user?.name ?? user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Card className="text-center py-16">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-slate-900">
              Doctor Portal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 max-w-sm mx-auto">
              Patient access management and clinical review features are coming
              soon. This portal is currently under development.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
