/**
 * ProjectRepository
 * Single Responsibility: All Firestore read/write operations for projects.
 * Open/Closed: Extend by adding methods, never modify existing ones.
 * Dependency Inversion: Depends on Firestore abstraction, not concrete impl.
 *
 * Firestore structure:
 *   users/{uid}/projects/{projectId}  — project doc (includes milestones & progressHistory as subcollections)
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Project, ProjectFormData, Milestone, MilestoneFormData, ProgressEntry } from '../types';

const projectsPath = (uid: string) => collection(db, 'users', uid, 'projects');
const projectPath = (uid: string, pid: string) => doc(db, 'users', uid, 'projects', pid);
const milestonesPath = (uid: string, pid: string) => collection(db, 'users', uid, 'projects', pid, 'milestones');
const progressPath = (uid: string, pid: string) => collection(db, 'users', uid, 'projects', pid, 'progressHistory');

function toDate(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  return String(val);
}

export const ProjectRepository = {
  async getAll(uid: string): Promise<Project[]> {
    const q = query(projectsPath(uid), orderBy('priority', 'asc'));
    const snap = await getDocs(q);
    const projects: Project[] = [];

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const milestones = await ProjectRepository.getMilestones(uid, docSnap.id);
      const progressHistory = await ProjectRepository.getProgressHistory(uid, docSnap.id);

      projects.push({
        id: docSnap.id,
        title: data.title,
        description: data.description,
        status: data.status,
        completion: data.completion,
        priority: data.priority,
        currentFocus: data.currentFocus ?? '',
        milestones,
        progressHistory,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      });
    }
    return projects;
  },

  async getById(uid: string, pid: string): Promise<Project | null> {
    const snap = await getDoc(projectPath(uid, pid));
    if (!snap.exists()) return null;
    const data = snap.data();
    const milestones = await ProjectRepository.getMilestones(uid, pid);
    const progressHistory = await ProjectRepository.getProgressHistory(uid, pid);

    return {
      id: snap.id,
      title: data.title,
      description: data.description,
      status: data.status,
      completion: data.completion,
      priority: data.priority,
      currentFocus: data.currentFocus ?? '',
      milestones,
      progressHistory,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },

  async create(uid: string, formData: ProjectFormData): Promise<string> {
    const ref = await addDoc(projectsPath(uid), {
      ...formData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async update(uid: string, pid: string, data: Partial<ProjectFormData>): Promise<void> {
    await updateDoc(projectPath(uid, pid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(uid: string, pid: string): Promise<void> {
    await deleteDoc(projectPath(uid, pid));
  },

  async updatePriorities(uid: string, updates: { id: string; priority: number }[]): Promise<void> {
    await Promise.all(
      updates.map(({ id, priority }) =>
        updateDoc(projectPath(uid, id), { priority, updatedAt: serverTimestamp() })
      )
    );
  },

  // — Milestones —

  async getMilestones(uid: string, pid: string): Promise<Milestone[]> {
    // Get all milestones without orderBy to include docs without priority field
    const snap = await getDocs(milestonesPath(uid, pid));
    const milestones = snap.docs.map((d) => ({
      id: d.id,
      title: d.data().title,
      completed: d.data().completed,
      dueDate: d.data().dueDate,
      priority: d.data().priority ?? 999,
      createdAt: toDate(d.data().createdAt),
    }));
    // Sort by priority, then by createdAt for items without priority
    return milestones.sort((a, b) => a.priority - b.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async addMilestone(uid: string, pid: string, data: MilestoneFormData): Promise<string> {
    // Get current max priority
    const milestones = await ProjectRepository.getMilestones(uid, pid);
    const maxPriority = milestones.length > 0 ? Math.max(...milestones.map(m => m.priority)) : 0;
    
    // Build document data without undefined fields (Firestore doesn't allow undefined)
    const docData: any = {
      title: data.title,
      completed: data.completed,
      priority: maxPriority + 1,
      createdAt: serverTimestamp(),
    };
    
    // Only include dueDate if it's provided
    if (data.dueDate) {
      docData.dueDate = data.dueDate;
    }
    
    const ref = await addDoc(milestonesPath(uid, pid), docData);
    await updateDoc(projectPath(uid, pid), { updatedAt: serverTimestamp() });
    return ref.id;
  },

  async updateMilestone(uid: string, pid: string, mid: string, data: Partial<Milestone>): Promise<void> {
    await updateDoc(doc(db, 'users', uid, 'projects', pid, 'milestones', mid), data);
    await updateDoc(projectPath(uid, pid), { updatedAt: serverTimestamp() });
  },

  async reorderMilestones(uid: string, pid: string, orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) => ({ id, priority: index }));
    await Promise.all(
      updates.map(({ id, priority }) =>
        updateDoc(doc(db, 'users', uid, 'projects', pid, 'milestones', id), { priority })
      )
    );
    await updateDoc(projectPath(uid, pid), { updatedAt: serverTimestamp() });
  },

  async deleteMilestone(uid: string, pid: string, mid: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'projects', pid, 'milestones', mid));
  },

  // — Progress History —

  async getProgressHistory(uid: string, pid: string): Promise<ProgressEntry[]> {
    const q = query(progressPath(uid, pid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      content: d.data().content,
      createdAt: toDate(d.data().createdAt),
    }));
  },

  async addProgressEntry(uid: string, pid: string, content: string): Promise<void> {
    await addDoc(progressPath(uid, pid), { content, createdAt: serverTimestamp() });
    await updateDoc(projectPath(uid, pid), {
      currentFocus: content,
      updatedAt: serverTimestamp(),
    });
  },
};
