import { useState } from 'react';
import { useProject } from '../../hooks/useProject';
import { ProjectFormData } from '../../types';
import { ProjectForm } from '../shared/ProjectForm';
import { StatusBadge } from '../shared/StatusBadge';
import { ProgressBar } from '../shared/ProgressBar';
import { MilestonesPanel } from './MilestonesPanel';
import { ProgressPanel } from './ProgressPanel';

interface Props {
  uid: string;
  projectId: string;
  onBack: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: Partial<ProjectFormData>) => Promise<void>;
}

export function ProjectDetail({ uid, projectId, onBack, onDelete, onUpdate }: Props) {
  const { project, loading, error, addMilestone, toggleMilestone, deleteMilestone, reorderMilestones, addProgressEntry } = useProject(uid, projectId);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveEdit = async (data: ProjectFormData) => {
    await onUpdate(projectId, data);
    setEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(projectId);
    onBack();
  };

  if (loading || !project) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280', fontFamily: 'monospace', letterSpacing: '0.06em' }}>LOADING...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', padding: '32px' }}>
        <p style={{ color: '#f87171' }}>{error}</p>
        <button onClick={onBack} style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e5e7eb', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>
        {`
          @media (max-width: 768px) {
            .project-detail-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
            .project-detail-grid > div:first-child {
              order: 1;
            }
            .project-detail-grid > div:last-child {
              order: 2;
            }
          }
        `}
      </style>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#f59e0b',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← MISSION CONTROL
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setEditing(!editing)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#9ca3af',
              padding: '5px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
            }}
          >
            {editing ? 'CANCEL' : 'EDIT'}
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(248,113,113,0.3)',
                color: '#f87171',
                padding: '5px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'monospace',
                letterSpacing: '0.06em',
              }}
            >
              DELETE
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#f87171', fontFamily: 'monospace' }}>CONFIRM?</span>
              <button onClick={handleDelete} style={{ background: '#f87171', border: 'none', color: '#111', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700 }}>YES</button>
              <button onClick={() => setConfirmDelete(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' }}>NO</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Project header */}
        {editing ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '6px',
            padding: '24px',
            marginBottom: '32px',
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em', color: '#f59e0b' }}>
              EDIT PROJECT
            </h3>
            <ProjectForm initial={project} onSave={handleSaveEdit} onCancel={() => setEditing(false)} />
          </div>
        ) : (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f3f4f6' }}>
                {project.title}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6, maxWidth: '640px' }}>
                {project.description}
              </p>
            )}
            <div style={{ maxWidth: '320px' }}>
              <ProgressBar value={project.completion} />
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="project-detail-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '32px' }}>
          {/* Left: Progress (Where I'm at) - 3/4 space */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '6px',
            padding: '20px',
          }}>
            <ProgressPanel
              currentFocus={project.currentFocus}
              history={project.progressHistory}
              onAddEntry={addProgressEntry}
            />
          </div>

          {/* Right: Milestones - 1/4 space but bigger */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '6px',
            padding: '20px',
          }}>
            <MilestonesPanel
              milestones={project.milestones}
              onAdd={(title, dueDate) => addMilestone({ title, completed: false, dueDate, priority: 999 })}
              onToggle={toggleMilestone}
              onDelete={deleteMilestone}
              onReorder={reorderMilestones}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
