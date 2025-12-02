// API Configuration
// This file configures the API base URL for different environments

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Helper function to construct API URLs
export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If API_BASE_URL is empty, use relative paths (for same-domain deployment)
  // Otherwise, use the full API URL
  return API_BASE_URL ? `${API_BASE_URL}/${cleanPath}` : `/${cleanPath}`;
}
