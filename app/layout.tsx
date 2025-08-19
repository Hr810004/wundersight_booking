import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clinic Appointments",
  description: "Minimal appointment booking app (UTC)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
          <nav style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ fontWeight: 700 }}>Clinic Appointments</a>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/login">Login</a>
              <a href="/register">Register</a>
              <a href="/patient">Patient</a>
              <a href="/admin">Admin</a>
            </div>
          </nav>
        </header>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: '16px' }}>{children}</main>
      </body>
    </html>
  );
}
