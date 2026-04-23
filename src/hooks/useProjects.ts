import { useState, useEffect, useCallback } from 'react';
import { ProjectService } from '../services/ProjectService';
import { Project, ProjectFormData } from '../types';

export function useProjects(uid: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ProjectService.listProjects(uid);
      setProjects(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const createProject = async (data: ProjectFormData) => {
    if (!uid) return;
    await ProjectService.createProject(uid, { ...data, priority: projects.length });
    await load();
  };

  const updateProject = async (pid: string, data: Partial<ProjectFormData>) => {
    if (!uid) return;
    await ProjectService.updateProject(uid, pid, data);
    await load();
  };

  const deleteProject = async (pid: string) => {
    if (!uid) return;
    await ProjectService.deleteProject(uid, pid);
    await load();
  };

  const reorderProjects = async (orderedIds: string[]) => {
    if (!uid) return;
    // Optimistic update
    const reordered = orderedIds.map(
      (id) => projects.find((p) => p.id === id)!
    ).filter(Boolean);
    setProjects(reordered);
    await ProjectService.reorderProjects(uid, orderedIds);
  };

  return { projects, loading, error, createProject, updateProject, deleteProject, reorderProjects, refresh: load };
}
