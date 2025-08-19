import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyPassword, signJwt } from '@/app/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
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
  } catch (e) {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}


