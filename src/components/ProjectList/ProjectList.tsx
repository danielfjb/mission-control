import React, { useState, useRef } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from '../shared/ProjectForm';
import { ProjectFormData } from '../../types';

interface Props {
  uid: string;
  onOpenProject: (id: string) => void;
  onLogout: () => void;
  userEmail: string;
}

export function ProjectList({ uid, onOpenProject, onLogout, userEmail }: Props) {
  const { projects, loading, error, createProject, reorderProjects } = useProjects(uid);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const dragItem = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    dragItem.current = id;
    setDraggingId(id);
  };

  const handleDrop = async (_e: React.DragEvent, targetId: string) => {
    if (!dragItem.current || dragItem.current === targetId) return;
    const ids = projects.map((p) => p.id);
    const fromIdx = ids.indexOf(dragItem.current);
    const toIdx = ids.indexOf(targetId);
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, dragItem.current);
    await reorderProjects(reordered);
    dragItem.current = null;
    setDraggingId(null);
  };

  const handleCreate = async (data: ProjectFormData) => {
    await createProject(data);
    setShowForm(false);
  };

  const filtered = projects.filter((p) => filter === 'all' || p.status === filter);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      color: '#e5e7eb',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f59e0b' }}>
            MISSION CONTROL
          </span>
          <span style={{ fontSize: '11px', color: '#4b5563', fontFamily: 'monospace' }}>
            {projects.length} PROJECT{projects.length !== 1 ? 'S' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{userEmail}</span>
          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#6b7280',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'active', 'paused', 'completed', 'archived'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'rgba(245,158,11,0.15)' : 'transparent',
                  border: `1px solid ${filter === f ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                  color: filter === f ? '#f59e0b' : '#6b7280',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            style={{
              background: '#f59e0b',
              border: 'none',
              color: '#111',
              padding: '8px 18px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
            }}
          >
            + NEW PROJECT
          </button>
        </div>

        {/* New project form */}
        {showForm && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '6px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '0.06em', color: '#f59e0b' }}>
              NEW PROJECT
            </h3>
            <ProjectForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>Error: {error}</p>
        )}

        {/* Loading */}
        {loading && (
          <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
            LOADING...
          </p>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#4b5563' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⊘</div>
            <p style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.06em' }}>
              {filter === 'all' ? 'NO PROJECTS YET' : `NO ${filter.toUpperCase()} PROJECTS`}
            </p>
          </div>
        )}

        {/* Project list — drag to reorder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isDragging={draggingId === project.id}
              onDragStart={handleDragStart}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onDragEnd={() => setDraggingId(null)}
              onClick={onOpenProject}
            />
          ))}
        </div>

        {projects.length > 1 && (
          <p style={{ textAlign: 'center', color: '#374151', fontSize: '11px', marginTop: '20px', fontFamily: 'monospace' }}>
            DRAG TO REORDER PRIORITY
          </p>
        )}
      </div>
    </div>
  );
}
