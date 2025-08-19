"use client";
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/Card';
import { Alert } from '@/app/components/Alert';
import { useAuth } from '@/app/context/auth-context';
import { useRouter } from 'next/navigation';

type BookingRow = {
  id: string;
  createdAt: string;
  slot: { startAt: string; endAt: string };
  user: { name: string; email: string };
};

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // User is not authenticated, redirect to login
      router.push('/login');
      return;
    }
    
    if (user && user.role === 'admin') {
      const token = localStorage.getItem('token');
      async function load() {
        try {
          const res = await fetch('/api/all-bookings', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const raw = (await res.json()) as unknown;
          if (!res.ok) {
            const errMsg = (raw as { error?: { message?: string } })?.error?.message || 'Failed to load bookings';
            throw new Error(errMsg);
          }
          setBookings(raw as BookingRow[]);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load bookings');
        }
      }
      load();
    }
  }, [user, isLoading]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {isLoading ? (
        <p>Loading...</p>
      ) : !user ? (
        <Alert type="warning" title="Authentication Required">
          <p>You need to be logged in to view this dashboard.</p>
          <p>Please <a href="/login">login</a> or <a href="/register">register</a> to continue.</p>
        </Alert>
      ) : user.role !== 'admin' ? (
        <Alert type="error" title="Access Denied">
          <p>You do not have permission to access this dashboard.</p>
          <p>Please <a href="/login">login</a> with an admin account.</p>
        </Alert>
      ) : (
        <>
          <h2>Admin Dashboard</h2>
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
          <Card>
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
                  <tr>
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
          </Card>
        </>
      )}
    </div>
  );
}


