import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { z } from 'zod';

const BookSchema = z.object({ slotId: z.uuid() });

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || undefined;
    const auth = await requireAuth(authHeader);
    // Only patients can book
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((auth as any).error) {
      return new Response(JSON.stringify(auth), { status: 401, headers: { 'content-type': 'application/json' } });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (auth as any).user as { id: string; role: string };
    if (user.role !== 'patient') {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Only patients can book' } }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      );
    }

    const body = await req.json();
    const parsed = BookSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      );
    }

    const { slotId } = parsed.data;
    // Ensure slot exists
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Slot not found' } }),
        { status: 404, headers: { 'content-type': 'application/json' } },
      );
    }

    try {
      const booking = await prisma.booking.create({ data: { slotId, userId: user.id } });
      return new Response(JSON.stringify(booking), { status: 201, headers: { 'content-type': 'application/json' } });
    } catch (e) {
      // Unique constraint on slotId
      return new Response(
        JSON.stringify({ error: { code: 'SLOT_TAKEN', message: 'This slot is already booked' } }),
        { status: 409, headers: { 'content-type': 'application/json' } },
      );
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}


