import type { Context } from 'hono';
import type { Env } from './types';

/**
 * Get allowed origins from environment
 * In development: allows localhost
 * In production: uses ALLOWED_ORIGINS env var
 */
export function getAllowedOrigins(env: Env): string[] {
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()) || [];

  // Always allow localhost in development
  const devOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8788',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8788',
  ];

  return [...new Set([...allowedOrigins, ...devOrigins])];
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(c: Context<{ Bindings: Env }>, origin?: string): void {
  const allowedOrigins = getAllowedOrigins(c.env);
  const requestOrigin = origin || c.req.header('Origin');

  if (requestOrigin && isOriginAllowed(requestOrigin, allowedOrigins)) {
    c.header('Access-Control-Allow-Origin', requestOrigin);
  } else {
    // Fallback to first allowed origin or '*' for development
    c.header('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Max-Age', '86400');
}
