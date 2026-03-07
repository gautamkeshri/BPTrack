import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import DoctorPortalPage from "@/pages/doctor/DoctorPortalPage";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === "doctor") {
    return (
      <Switch>
        <Route path="/doctor/portal" component={DoctorPortalPage} />
        <Route path="/">
          <Redirect to="/doctor/portal" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  // role === "patient"
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/doctor/portal">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
