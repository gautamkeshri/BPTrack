import { createContext, useContext, useEffect, useState } from "react";
import { getApiUrl } from "@/config";
import { getSessionToken, setSessionToken, clearSessionToken } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "patient" | "doctor";
  doctorId?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: validate existing token
  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(getApiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          clearSessionToken();
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.data) setUser(json.data);
      })
      .catch(() => clearSessionToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json?.error?.message ?? "Login failed");
    }

    setSessionToken(json.data.token);
    setUser(json.data.user);
  };

  const logout = async () => {
    const token = getSessionToken();
    if (token) {
      await fetch(getApiUrl("/api/auth/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }).catch(() => {});
    }
    clearSessionToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
