"use client";
import { useAuth } from "@/app/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="/" style={{ fontWeight: 700 }}>Clinic Appointments</Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Welcome, {user.name} ({user.role})
            </span>
            <Link href={user.role === 'admin' ? "/admin" : "/patient"}>
              {user.role === 'admin' ? "Admin Dashboard" : "Patient Dashboard"}
            </Link>
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#111', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
            <Link href="/patient">Patient Dashboard</Link>
            <Link href="/admin">Admin Dashboard</Link>
          </>
        )}
      </div>
    </nav>
  );
}