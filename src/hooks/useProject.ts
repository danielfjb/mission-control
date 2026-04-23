import { useState, useEffect, useCallback } from 'react';
import { ProjectService } from '../services/ProjectService';
import { Project, MilestoneFormData } from '../types';

export function useProject(uid: string | null, pid: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!uid || !pid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ProjectService.getProject(uid, pid);
      setProject(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [uid, pid]);

  useEffect(() => { load(); }, [load]);

  const addMilestone = async (data: MilestoneFormData) => {
    if (!uid || !pid) return;
    await ProjectService.addMilestone(uid, pid, data);
    await load();
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    if (!uid || !pid) return;
    await ProjectService.toggleMilestone(uid, pid, milestoneId, completed);
    await load();
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!uid || !pid) return;
    await ProjectService.deleteMilestone(uid, pid, milestoneId);
    await load();
  };

  const addProgressEntry = async (content: string) => {
    if (!uid || !pid) return;
    await ProjectService.addProgressEntry(uid, pid, content);
    await load();
  };

  return { project, loading, error, addMilestone, toggleMilestone, deleteMilestone, addProgressEntry, refresh: load };
}
