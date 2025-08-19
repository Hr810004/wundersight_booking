import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/auth-context";
import { Navigation } from "@/app/components/Navigation";

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
        <AuthProvider>
          <header style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <Navigation />
          </header>
          <main style={{ maxWidth: 960, margin: '0 auto', padding: '16px' }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
