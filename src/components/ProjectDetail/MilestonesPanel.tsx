import { useState, useRef } from 'react';
import { Milestone } from '../../types';

interface Props {
  milestones: Milestone[];
  onAdd: (title: string, dueDate?: string) => Promise<void>;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
}

export function MilestonesPanel({ milestones, onAdd, onToggle, onDelete, onReorder }: Props) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const dragItem = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setAdding(true);
    await onAdd(title.trim(), dueDate || undefined);
    setTitle('');
    setDueDate('');
    setAdding(false);
  };

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    dragItem.current = id;
    setDraggingId(id);
  };

  const handleDrop = async (_e: React.DragEvent, targetId: string) => {
    if (!dragItem.current || dragItem.current === targetId) return;
    const ids = milestones.map((m) => m.id);
    const fromIdx = ids.indexOf(dragItem.current);
    const toIdx = ids.indexOf(targetId);
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, dragItem.current);
    await onReorder(reordered);
    dragItem.current = null;
    setDraggingId(null);
  };

  const done = milestones.filter((m) => m.completed).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.08em', color: '#9ca3af' }}>
          MILESTONES
        </h3>
        {milestones.length > 0 && (
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6b7280' }}>
            {done}/{milestones.length}
          </span>
        )}
      </div>

      {/* Add milestone row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input
          style={{
            flex: 2,
            minWidth: '120px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            color: '#e5e7eb',
            padding: '7px 10px',
            fontSize: '13px',
            fontFamily: 'inherit',
            outline: 'none',
          }}
          placeholder="Add milestone..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        {showDateInput && (
          <input
            type="date"
            style={{
              flex: 1,
              minWidth: '100px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: '#6b7280',
              padding: '7px 10px',
              fontSize: '12px',
              fontFamily: 'inherit',
              outline: 'none',
              colorScheme: 'dark',
            }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        )}
        <button
          onClick={() => setShowDateInput(!showDateInput)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#6b7280',
            padding: '7px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}
          title={showDateInput ? 'Hide date' : 'Add due date'}
        >
          📅
        </button>
        <button
          onClick={handleAdd}
          disabled={adding || !title.trim()}
          style={{
            background: adding || !title.trim() ? 'rgba(255,255,255,0.05)' : 'rgba(245,158,11,0.2)',
            border: '1px solid rgba(245,158,11,0.4)',
            color: adding || !title.trim() ? '#6b7280' : '#f59e0b',
            padding: '7px 14px',
            borderRadius: '4px',
            cursor: adding || !title.trim() ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontFamily: 'monospace',
            opacity: adding || !title.trim() ? 0.5 : 1,
          }}
        >
          ADD
        </button>
      </div>

      {/* Milestone items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {milestones.map((m, index) => (
          <div
            key={m.id}
            draggable
            onDragStart={(e) => handleDragStart(e, m.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, m.id)}
            onDragEnd={() => setDraggingId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              background: draggingId === m.id ? 'rgba(245,158,11,0.08)' : m.completed ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${draggingId === m.id ? 'rgba(245,158,11,0.4)' : m.completed ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '4px',
              cursor: 'grab',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Priority handle */}
            <div style={{
              color: '#4b5563',
              fontSize: '10px',
              fontFamily: 'monospace',
              paddingTop: '1px',
              minWidth: '16px',
              flexShrink: 0,
            }}>
              #{String(index + 1).padStart(2, '0')}
            </div>

            <input
              type="checkbox"
              checked={m.completed}
              onChange={(e) => onToggle(m.id, e.target.checked)}
              style={{ accentColor: '#4ade80', cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{
              flex: 1,
              fontSize: '13px',
              color: m.completed ? '#6b7280' : '#d1d5db',
              textDecoration: m.completed ? 'line-through' : 'none',
            }}>
              {m.title}
            </span>
            {m.dueDate && (
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6b7280', flexShrink: 0 }}>
                {m.dueDate}
              </span>
            )}
            <button
              onClick={() => onDelete(m.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4b5563',
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {milestones.length === 0 && (
          <p style={{ fontSize: '12px', color: '#4b5563', margin: 0, fontStyle: 'italic' }}>
            No milestones yet.
          </p>
        )}
      </div>

      {milestones.length > 1 && (
        <p style={{ textAlign: 'center', color: '#374151', fontSize: '10px', marginTop: '16px', fontFamily: 'monospace' }}>
          DRAG TO REORDER PRIORITY
        </p>
      )}
    </div>
  );
}
