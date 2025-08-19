"use client";
import { useEffect, useState } from 'react';

type BookingRow = {
  id: string;
  createdAt: string;
  slot: { startAt: string; endAt: string };
  user: { name: string; email: string };
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    async function load() {
      try {
        const res = await fetch('/api/all-bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: BookingRow[] | { error?: { message?: string } } = await res.json();
        if (!res.ok) throw new Error((data as any)?.error?.message || 'Failed to load bookings');
        setBookings(data as BookingRow[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load bookings');
      }
    }
    load();
  }, []);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Patient</th>
            <th style={{ textAlign: 'left' }}>Email</th>
            <th style={{ textAlign: 'left' }}>Slot (UTC)</th>
            <th style={{ textAlign: 'left' }}>Booked At</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.user.name}</td>
              <td>{b.user.email}</td>
              <td>
                {new Date(b.slot.startAt).toISOString()} → {new Date(b.slot.endAt).toISOString()}
              </td>
              <td>{new Date(b.createdAt).toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && <p>No bookings yet.</p>}
    </div>
  );
}


