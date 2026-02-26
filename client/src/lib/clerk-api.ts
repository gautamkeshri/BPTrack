// Clerk-integrated API request helpers
import { getApiUrl } from "@/config";

// Global token getter function - will be set by ClerkProvider wrapper
let getClerkToken: (() => Promise<string | null>) | null = null;

/**
 * Set the Clerk token getter function
 * This should be called once when the app initializes with Clerk
 */
export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  getClerkToken = getter;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Make an API request with Clerk authentication token
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const apiUrl = getApiUrl(url);

  // Get Clerk token if available
  const token = getClerkToken ? await getClerkToken() : null;

  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

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

/**
 * Create a query function with Clerk authentication
 */
export function getQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
}) {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    const url = queryKey.join("/") as string;
    const apiUrl = getApiUrl(url);

    // Get Clerk token if available
    const token = getClerkToken ? await getClerkToken() : null;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

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
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as T;
    }

    return json as T;
  };
}
