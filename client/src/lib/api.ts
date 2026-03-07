// API request helpers — plain fetch, no third-party auth
import { getApiUrl } from "@/config";

const TOKEN_KEY = "bptrack_session_token";

export function getSessionToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSessionToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const apiUrl = getApiUrl(url);
  const token = getSessionToken();

  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(apiUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export function getQueryFn<T>(options: { on401: UnauthorizedBehavior }) {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    const url = queryKey.join("/") as string;
    const apiUrl = getApiUrl(url);
    const token = getSessionToken();

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(apiUrl, {
      headers,
      credentials: "include",
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const json = await res.json();

    // Unwrap API response: {success: true, data: ...} -> data
    if (json && typeof json === "object" && "data" in json) {
      return json.data as T;
    }

    return json as T;
  };
}
