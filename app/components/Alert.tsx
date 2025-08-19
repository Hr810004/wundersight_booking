"use client";
import { ReactNode } from 'react';

type AlertProps = {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
};

export function Alert({ type, title, children, onClose }: AlertProps) {
  const styles = {
    base: {
      padding: '12px 16px',
      borderRadius: '6px',
      border: '1px solid',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
    },
    info: {
      background: '#e1f5fe',
      borderColor: '#03a9f4',
      color: '#01579b',
    },
    warning: {
      background: '#fff8e1',
      borderColor: '#ffc107',
      color: '#5d4037',
    },
    error: {
      background: '#ffebee',
      borderColor: '#f44336',
      color: '#b71c1c',
    },
    success: {
      background: '#e8f5e9',
      borderColor: '#4caf50',
      color: '#1b5e20',
    },
    title: {
      fontWeight: 'bold',
      marginBottom: title && children ? '4px' : '0',
    },
    close: {
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '0',
      marginLeft: 'auto',
      lineHeight: '1',
    },
  };

  const getStyle = () => {
    switch (type) {
      case 'info':
        return { ...styles.base, ...styles.info };
      case 'warning':
        return { ...styles.base, ...styles.warning };
      case 'error':
        return { ...styles.base, ...styles.error };
      case 'success':
        return { ...styles.base, ...styles.success };
      default:
        return { ...styles.base, ...styles.info };
    }
  };

  return (
    <div style={getStyle()}>
      <div style={{ flex: 1 }}>
        {title && <div style={styles.title}>{title}</div>}
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} style={styles.close}>
          ×
        </button>
      )}
    </div>
  );
}