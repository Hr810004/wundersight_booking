"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';

export default function RegisterPage() {
  const [name, setName] = useState('');
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
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Register failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      router.push('/patient');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 style={{ marginBottom: 12 }}>Register</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button disabled={loading}>{loading ? '...' : 'Create account'}</Button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </Card>
  );
}


