import { NextResponse } from 'next/server';
import { rateLimitRequest } from '@/lib/rate-limit';

interface RateLimitConfig {
  maxRequests: number;
  windowMs?: number;
}

export function withRateLimit(
  req: Request,
  config: RateLimitConfig
): NextResponse | null {
  const result = rateLimitRequest(req, config);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt),
        },
      }
    );
  }

  return null;
}
