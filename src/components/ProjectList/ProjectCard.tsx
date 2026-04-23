import React from 'react';
import { Project } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { ProgressBar } from '../shared/ProgressBar';

interface Props {
  project: Project;
  index: number;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onClick: (id: string) => void;
}

export function ProjectCard({
  project, index, isDragging,
  onDragStart, onDragOver, onDrop, onDragEnd, onClick,
}: Props) {
  const completedMilestones = project.milestones.filter((m) => m.completed).length;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, project.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(project.id)}
      style={{
        background: isDragging ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isDragging ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '6px',
        padding: '16px 20px',
        cursor: 'grab',
        transition: 'all 0.15s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)';
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Priority handle */}
        <div style={{
          color: '#4b5563',
          fontSize: '12px',
          fontFamily: 'monospace',
          paddingTop: '2px',
          minWidth: '24px',
          flexShrink: 0,
        }}>
          #{String(index + 1).padStart(2, '0')}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#f3f4f6',
              letterSpacing: '-0.01em',
            }}>
              {project.title}
            </span>
            <StatusBadge status={project.status} />
          </div>

          {project.description && (
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: '0 0 10px',
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {project.description}
            </p>
          )}

          {project.currentFocus && (
            <p style={{
              fontSize: '12px',
              color: '#f59e0b',
              margin: '0 0 10px',
              fontStyle: 'italic',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              ↳ {project.currentFocus}
            </p>
          )}

          <ProgressBar value={project.completion} />

          {project.milestones.length > 0 && (
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '6px 0 0', fontFamily: 'monospace' }}>
              {completedMilestones}/{project.milestones.length} milestones
            </p>
          )}
        </div>

        {/* Drag indicator */}
        <div style={{ color: '#374151', fontSize: '16px', paddingTop: '2px', flexShrink: 0 }}>
          ⠿
        </div>
      </div>
    </div>
  );
}
