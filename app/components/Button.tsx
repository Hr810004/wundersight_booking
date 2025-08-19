"use client";
import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' };

export function Button({ variant = 'primary', style, ...rest }: Props) {
  const base: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 6,
    border: '1px solid transparent',
    fontWeight: 600,
  };
  const theme: Record<string, React.CSSProperties> = {
    primary: { background: '#111', color: '#fff' },
    secondary: { background: '#f5f5f5', color: '#111', borderColor: '#ddd' },
  };
  return <button {...rest} style={{ ...base, ...theme[variant], ...style }} />;
}


