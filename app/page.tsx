"use client";

import Link from 'next/link';
import { useAuth } from '@/app/context/auth-context';
import { Alert } from '@/app/components/Alert';

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1>Clinic Appointments</h1>
      <p>All times are handled in UTC. Demo app.</p>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : !user ? (
        <Alert type="info" title="Welcome!">
          <p>Please login or register to access the dashboards:</p>
          <div style={{ display: 'flex', gap: 12, marginTop: '12px' }}>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        </Alert>
      ) : (
        <Alert type="success" title="Welcome back!">
          <p>You are logged in as {user.name} ({user.role}).</p>
          <div style={{ display: 'flex', gap: 12, marginTop: '12px' }}>
            <Link href={user.role === 'admin' ? "/admin" : "/patient"}>
              {user.role === 'admin' ? "Admin Dashboard" : "Patient Dashboard"}
            </Link>
          </div>
        </Alert>
      )}
      
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/patient">Patient Dashboard</Link>
        <Link href="/admin">Admin Dashboard</Link>
      </div>
    </div>
  );
}
