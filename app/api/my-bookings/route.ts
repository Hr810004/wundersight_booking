import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || undefined;
    const auth = await requireAuth(authHeader);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((auth as any).error) {
      return new Response(JSON.stringify(auth), { status: 401, headers: { 'content-type': 'application/json' } });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (auth as any).user as { id: string; role: string };
    if (user.role !== 'patient') {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Patients only' } }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: { slot: true },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(bookings), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}


