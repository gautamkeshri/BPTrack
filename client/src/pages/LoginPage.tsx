import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message ?? "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: "patient" | "doctor") => {
    if (role === "patient") {
      setEmail("patient@demo.com");
      setPassword("demo1234");
    } else {
      setEmail("doctor@demo.com");
      setPassword("doctor1234");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">BPTrack</h1>
          <p className="text-sm text-slate-500">Blood Pressure Monitor</p>
        </div>

        {/* Login card */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Enter your email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <Card className="shadow-sm border-dashed">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900"
            onClick={() => setShowDemo(!showDemo)}
          >
            Demo credentials
            {showDemo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showDemo && (
            <CardContent className="pt-0 pb-4 space-y-3">
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</p>
                <p className="text-sm font-mono text-slate-700">patient@demo.com</p>
                <p className="text-sm font-mono text-slate-700">demo1234</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => fillDemo("patient")}
                >
                  Use these credentials
                </Button>
              </div>
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Doctor</p>
                <p className="text-sm font-mono text-slate-700">doctor@demo.com</p>
                <p className="text-sm font-mono text-slate-700">doctor1234</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => fillDemo("doctor")}
                >
                  Use these credentials
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
