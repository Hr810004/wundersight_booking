"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      if (data.role === 'admin') router.push('/admin');
      else router.push('/patient');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 style={{ marginBottom: 12 }}>Login</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button disabled={loading}>{loading ? '...' : 'Login'}</Button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </Card>
  );
}


