import React, { useState } from 'react';
import { Project, ProjectFormData, ProjectStatus } from '../../types';
import { ProjectService } from '../../services/ProjectService';

interface Props {
  initial?: Project;
  onSave: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '4px',
  color: '#e5e7eb',
  padding: '8px 12px',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  outline: 'none',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontFamily: 'monospace',
  letterSpacing: '0.08em',
  color: '#9ca3af',
  marginBottom: '6px',
  textTransform: 'uppercase',
};

export function ProjectForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<ProjectFormData>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          status: initial.status,
          completion: initial.completion,
          priority: initial.priority,
          currentFocus: initial.currentFocus,
        }
      : ProjectService.defaultFormData()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={LABEL_STYLE}>Project Title *</label>
        <input
          style={INPUT_STYLE}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="What are you building?"
        />
      </div>

      <div>
        <label style={LABEL_STYLE}>Description</label>
        <textarea
          style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Brief overview of the project..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={LABEL_STYLE}>Status</label>
          <select
            style={{ ...INPUT_STYLE, cursor: 'pointer' }}
            value={form.status}
            onChange={(e) => set('status', e.target.value as ProjectStatus)}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label style={LABEL_STYLE}>Completion ({form.completion}%)</label>
          <input
            type="range"
            min={0}
            max={100}
            value={form.completion}
            onChange={(e) => set('completion', Number(e.target.value))}
            style={{ width: '100%', marginTop: '8px', accentColor: '#f59e0b' }}
          />
        </div>
      </div>

      {error && (
        <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px' }}>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#9ca3af',
            padding: '8px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            background: '#f59e0b',
            border: 'none',
            color: '#111',
            padding: '8px 20px',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'SAVING...' : initial ? 'SAVE CHANGES' : 'CREATE PROJECT'}
        </button>
      </div>
    </div>
  );
}
