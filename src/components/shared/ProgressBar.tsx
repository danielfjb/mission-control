import React from 'react';

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const color = clamped === 100 ? '#4ade80' : clamped >= 60 ? '#60a5fa' : '#f59e0b';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        flex: 1,
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${clamped}%`,
          height: '100%',
          background: color,
          borderRadius: '2px',
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af', minWidth: '32px' }}>
        {clamped}%
      </span>
    </div>
  );
}
