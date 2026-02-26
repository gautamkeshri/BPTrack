import { QueryClient } from "@tanstack/react-query";
import { getQueryFn } from "./clerk-api";

// Re-export apiRequest from clerk-api for backwards compatibility
export { apiRequest } from "./clerk-api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
