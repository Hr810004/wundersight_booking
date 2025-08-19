import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';

function parseDateISO(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');
    const from = parseDateISO(fromStr);
    const to = parseDateISO(toStr);
    if (!from || !to) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'from/to required YYYY-MM-DD' } }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      );
    }
    const fromDate = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 0, 0, 0));
    const toDate = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 23, 59, 59));

    // Fetch available slots only: slots with no bookings
    const slots = await prisma.slot.findMany({
      where: {
        startAt: { gte: fromDate },
        endAt: { lte: toDate },
        bookings: { none: {} },
      },
      orderBy: { startAt: 'asc' },
    });

    return new Response(JSON.stringify(slots), {
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


