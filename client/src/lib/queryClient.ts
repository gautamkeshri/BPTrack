import { QueryClient } from "@tanstack/react-query";
import { getQueryFn } from "./api";

// Re-export apiRequest from api for backwards compatibility
export { apiRequest } from "./api";

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
