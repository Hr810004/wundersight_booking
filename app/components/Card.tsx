import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 16,
        border: '1px solid #eee',
        borderRadius: 8,
        background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </div>
  );
}


