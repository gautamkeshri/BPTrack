// Type definitions for Cloudflare Workers environment

export interface Env {
  // D1 Database binding
  DB: D1Database;

  // Workers KV binding for sessions
  SESSIONS: KVNamespace;

  // Environment variables
  SESSION_SECRET?: string;
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT?: string;
}

// Request context
export interface RequestContext {
  env: Env;
  executionCtx: ExecutionContext;
}

// Session data structure
export interface SessionData {
  userId?: string;
  activeProfileId?: string;
  createdAt: number;
  expiresAt: number;
}

// API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}
