"use client";
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

type Slot = { id: string; startAt: string; endAt: string };
type Booking = { id: string; slot: Slot };

export default function PatientDashboard() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { from, to } = useMemo(() => {
    const now = new Date();
    const to = new Date(now);
    to.setUTCDate(now.getUTCDate() + 6);
    return { from: toISODate(now), to: toISODate(to) };
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/slots?from=${from}&to=${to}`);
      const data = (await res.json()) as unknown;
      if (!res.ok) {
        const errMsg = (data as { error?: { message?: string } })?.error?.message || 'Failed to load slots';
        throw new Error(errMsg);
      }
      setSlots(data as Slot[]);
      if (token) {
        const r2 = await fetch('/api/my-bookings', { headers: { Authorization: `Bearer ${token}` } });
        const d2: Booking[] | { error?: { message?: string } } = await r2.json();
        if (r2.ok) setBookings(d2 as Booking[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function book(slotId: string) {
    if (!token) {
      setError('Please login first');
      return;
    }
    setError(null);
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slotId }),
    });
    const data: { error?: { message?: string } } = await res.json();
    if (!res.ok) {
      setError(data?.error?.message || 'Booking failed');
    }
    await load();
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Patient Dashboard</h2>
      <p>Showing available slots between {from} and {to} (UTC)</p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <Card>
        <h3 style={{ marginBottom: 10 }}>Available Slots</h3>
        <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
          {slots.map((s) => (
            <li key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                {new Date(s.startAt).toISOString()} → {new Date(s.endAt).toISOString()}
              </span>
              <Button onClick={() => book(s.id)}>Book</Button>
            </li>
          ))}
          {slots.length === 0 && <li>No available slots</li>}
        </ul>
      </Card>

      <Card>
        <h3 style={{ marginBottom: 10 }}>My Bookings</h3>
        <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
          {bookings.map((b) => (
            <li key={b.id}>
              {new Date(b.slot.startAt).toISOString()} → {new Date(b.slot.endAt).toISOString()}
            </li>
          ))}
          {bookings.length === 0 && <li>No bookings yet</li>}
        </ul>
      </Card>
    </div>
  );
}


