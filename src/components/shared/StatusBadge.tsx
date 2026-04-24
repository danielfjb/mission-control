import { ProjectStatus } from '../../types';

const CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  active:    { label: 'ACTIVE',     color: '#4ade80' },
  paused:    { label: 'PAUSED',     color: '#facc15' },
  completed: { label: 'COMPLETED',  color: '#60a5fa' },
  archived:  { label: 'ARCHIVED',   color: '#6b7280' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, color } = CONFIG[status];
  return (
    <span style={{
      fontFamily: 'monospace',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.1em',
      color,
      border: `1px solid ${color}`,
      borderRadius: '2px',
      padding: '2px 6px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
