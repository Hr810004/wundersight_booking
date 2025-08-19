import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hashPassword, signJwt } from '@/app/lib/auth';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ error: { code: 'CONFIG', message: 'DATABASE_URL is not configured' } }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      );
    }
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      );
    }
    const { name, email, password } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return new Response(
        JSON.stringify({ error: { code: 'EMAIL_TAKEN', message: 'Email already registered' } }),
        { status: 409, headers: { 'content-type': 'application/json' } },
      );
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { name, email, passwordHash, role: 'patient' } });
    const token = signJwt({ sub: user.id, role: 'patient', email: user.email, name: user.name });
    return new Response(
      JSON.stringify({ token, role: 'patient' }),
      { status: 201, headers: { 'content-type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}


