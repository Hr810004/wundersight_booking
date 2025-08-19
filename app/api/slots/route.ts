import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';

function parseDateISO(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ error: { code: 'CONFIG', message: 'DATABASE_URL is not configured' } }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      );
    }
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

    // Ensure slots exist for requested range (lazy seed)
    const data: { startAt: Date; endAt: Date }[] = [];
    const start = new Date(fromDate);
    for (let d = new Date(start); d <= toDate; d.setUTCDate(d.getUTCDate() + 1)) {
      for (let h = 9; h < 17; h++) {
        for (let m = 0; m < 60; m += 30) {
          const s = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m));
          const e = new Date(s.getTime() + 30 * 60 * 1000);
          data.push({ startAt: s, endAt: e });
        }
      }
    }
    if (data.length) {
      await prisma.slot.createMany({ data, skipDuplicates: true });
    }

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
  } catch (err) {
    console.error('SLOTS_ENDPOINT_ERROR', err);
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}


