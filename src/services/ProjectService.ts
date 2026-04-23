/**
 * ProjectService
 * Single Responsibility: Business logic for projects (validation, transformations).
 * Depends on ProjectRepository abstraction.
 */

import { ProjectRepository } from '../repositories/ProjectRepository';
import { Project, ProjectFormData, MilestoneFormData, ProjectStatus } from '../types';

export const ProjectService = {
  async listProjects(uid: string): Promise<Project[]> {
    return ProjectRepository.getAll(uid);
  },

  async getProject(uid: string, pid: string): Promise<Project | null> {
    return ProjectRepository.getById(uid, pid);
  },

  async createProject(uid: string, data: ProjectFormData): Promise<string> {
    const validated = ProjectService.validateFormData(data);
    return ProjectRepository.create(uid, validated);
  },

  async updateProject(uid: string, pid: string, data: Partial<ProjectFormData>): Promise<void> {
    return ProjectRepository.update(uid, pid, data);
  },

  async deleteProject(uid: string, pid: string): Promise<void> {
    return ProjectRepository.delete(uid, pid);
  },

  async reorderProjects(uid: string, orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) => ({ id, priority: index }));
    return ProjectRepository.updatePriorities(uid, updates);
  },

  async addMilestone(uid: string, pid: string, data: MilestoneFormData): Promise<string> {
    if (!data.title.trim()) throw new Error('Milestone title is required');
    return ProjectRepository.addMilestone(uid, pid, data);
  },

  async toggleMilestone(uid: string, pid: string, milestoneId: string, completed: boolean): Promise<void> {
    return ProjectRepository.updateMilestone(uid, pid, milestoneId, { completed });
  },

  async deleteMilestone(uid: string, pid: string, milestoneId: string): Promise<void> {
    return ProjectRepository.deleteMilestone(uid, pid, milestoneId);
  },

  async addProgressEntry(uid: string, pid: string, content: string): Promise<void> {
    if (!content.trim()) throw new Error('Progress entry cannot be empty');
    return ProjectRepository.addProgressEntry(uid, pid, content);
  },

  validateFormData(data: ProjectFormData): ProjectFormData {
    if (!data.title.trim()) throw new Error('Project title is required');
    if (data.completion < 0 || data.completion > 100) throw new Error('Completion must be 0–100');
    return { ...data, title: data.title.trim() };
  },

  getStatusLabel(status: ProjectStatus): string {
    const labels: Record<ProjectStatus, string> = {
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      archived: 'Archived',
    };
    return labels[status];
  },

  defaultFormData(): ProjectFormData {
    return {
      title: '',
      description: '',
      status: 'active',
      completion: 0,
      priority: 999,
      currentFocus: '',
    };
  },
};
