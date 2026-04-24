import { useState } from 'react';
import { ProgressEntry } from '../../types';

interface Props {
  currentFocus: string;
  history: ProgressEntry[];
  onAddEntry: (content: string) => Promise<void>;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function ProgressPanel({ currentFocus, history, onAddEntry }: Props) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await onAddEntry(text.trim());
    setText('');
    setSaving(false);
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 14px', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.08em', color: '#9ca3af' }}>
        WHERE I'M AT
      </h3>

      {/* Current focus (latest) */}
      {currentFocus && (
        <div style={{
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '4px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#f59e0b', margin: '0 0 6px', letterSpacing: '0.06em' }}>
            CURRENT STATUS
          </p>
          <p style={{ fontSize: '14px', color: '#e5e7eb', margin: 0, lineHeight: 1.6 }}>
            {currentFocus}
          </p>
        </div>
      )}

      {/* New entry */}
      <div style={{ marginBottom: '24px' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's the current state? What's blocking you? What's next? Write a quick update..."
          style={{
            width: '100%',
            minHeight: '100px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            color: '#e5e7eb',
            padding: '12px',
            fontSize: '14px',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: '#4b5563', fontFamily: 'monospace' }}>
            CMD+ENTER to save
          </span>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            style={{
              background: saving || !text.trim() ? 'rgba(255,255,255,0.05)' : '#f59e0b',
              border: 'none',
              color: saving || !text.trim() ? '#6b7280' : '#111',
              padding: '7px 16px',
              borderRadius: '4px',
              cursor: saving || !text.trim() ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
            }}
          >
            {saving ? 'SAVING...' : 'LOG PROGRESS'}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6b7280', letterSpacing: '0.06em', marginBottom: '12px' }}>
            HISTORY ({history.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.slice(0, showAllHistory ? undefined : 3).map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  borderLeft: `2px solid ${i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                  paddingLeft: '14px',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                }}
              >
                <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#4b5563', margin: '0 0 4px' }}>
                  {formatDate(entry.createdAt)}
                </p>
                <p style={{ fontSize: '13px', color: i === 0 ? '#d1d5db' : '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
          {history.length > 3 && (
            <button
              onClick={() => setShowAllHistory(!showAllHistory)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#6b7280',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'monospace',
                marginTop: '12px',
              }}
            >
              {showAllHistory ? 'SHOW LESS' : `SHOW ${history.length - 3} MORE`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
