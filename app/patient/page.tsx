"use client";
import { useEffect, useMemo, useState } from 'react';

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function PatientDashboard() {
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Failed to load slots');
      setSlots(data);
      if (token) {
        const r2 = await fetch('/api/my-bookings', { headers: { Authorization: `Bearer ${token}` } });
        const d2 = await r2.json();
        if (r2.ok) setBookings(d2);
      }
    } catch (e: any) {
      setError(e.message);
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
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message || 'Booking failed');
    }
    await load();
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Patient Dashboard</h2>
      <p>
        Showing available slots between {from} and {to} (UTC)
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <h3>Available Slots</h3>
      <ul style={{ display: 'grid', gap: 6, padding: 0, listStyle: 'none' }}>
        {slots.map((s) => (
          <li key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>
              {new Date(s.startAt).toISOString()} → {new Date(s.endAt).toISOString()}
            </span>
            <button onClick={() => book(s.id)}>Book</button>
          </li>
        ))}
        {slots.length === 0 && <li>No available slots</li>}
      </ul>

      <h3>My Bookings</h3>
      <ul style={{ display: 'grid', gap: 6, padding: 0, listStyle: 'none' }}>
        {bookings.map((b) => (
          <li key={b.id}>
            {new Date(b.slot.startAt).toISOString()} → {new Date(b.slot.endAt).toISOString()}
          </li>
        ))}
        {bookings.length === 0 && <li>No bookings yet</li>}
      </ul>
    </div>
  );
}


