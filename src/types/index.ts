export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface ProgressEntry {
  id: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  completion: number; // 0–100
  priority: number;   // lower = higher priority
  currentFocus: string; // "where I'm at right now"
  milestones: Milestone[];
  progressHistory: ProgressEntry[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectFormData = Omit<Project, 'id' | 'milestones' | 'progressHistory' | 'createdAt' | 'updatedAt'>;
export type MilestoneFormData = Omit<Milestone, 'id' | 'createdAt'>;
