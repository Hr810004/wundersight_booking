import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1>Clinic Appointments</h1>
      <p>All times are handled in UTC. Demo app.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/patient">Patient Dashboard</Link>
        <Link href="/admin">Admin Dashboard</Link>
      </div>
    </div>
  );
}
