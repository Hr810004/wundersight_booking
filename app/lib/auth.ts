import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export type JwtPayload = {
  sub: string;
  role: 'patient' | 'admin';
  email: string;
  name: string;
};

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function requireAuth(authorization?: string) {
  if (!authorization?.startsWith('Bearer ')) {
    return { error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' } };
  }
  const token = authorization.slice('Bearer '.length);
  const payload = verifyJwt(token);
  if (!payload) {
    return { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } };
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return { error: { code: 'UNAUTHORIZED', message: 'User not found' } };
  }
  return { user };
}


