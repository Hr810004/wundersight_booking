import type { ReactNode } from 'react';
import '../globals.css';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}


