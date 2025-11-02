// CORS middleware for Cloudflare Workers

import { Context, Next } from 'hono';
import type { Env } from '../types';

/**
 * CORS middleware
 */
export async function cors(c: Context<{ Bindings: Env }>, next: Next) {
  // Get allowed origins from environment or use defaults
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://bptrack.pages.dev', // Cloudflare Pages preview
  ];

  const origin = c.req.header('Origin');

  // Check if origin is allowed
  const isAllowed = origin && (
    allowedOrigins.includes(origin) ||
    allowedOrigins.includes('*')
  );

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Continue with request
  await next();

  // Add CORS headers to response
  if (isAllowed) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
  }
}
