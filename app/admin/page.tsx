"use client";
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    async function load() {
      try {
        const res = await fetch('/api/all-bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || 'Failed to load bookings');
        setBookings(data);
      } catch (e: any) {
        setError(e.message);
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


