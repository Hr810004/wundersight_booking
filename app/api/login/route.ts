import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyPassword, signJwt } from '@/app/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

// Simple in-memory login throttle (per deployment instance)
const loginAttempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 20;

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) {
    loginAttempts.set(key, { count: 1, firstAt: now });
    return false;
  }
  if (now - entry.firstAt > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ error: { code: 'CONFIG', message: 'DATABASE_URL is not configured' } }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      );
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(`login:${ip}`)) {
      return new Response(
        JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Too many attempts, try later' } }),
        { status: 429, headers: { 'content-type': 'application/json' } },
      );
    }
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      );
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      );
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      );
    }
    const token = signJwt({ sub: user.id, role: user.role, email: user.email, name: user.name });
    return new Response(JSON.stringify({ token, role: user.role }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}


