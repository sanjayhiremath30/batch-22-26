// src/store/useStudentStore.ts
/**
 * Zustand store for managing student data.
 * Handles loading, error handling, and provides CRUD helpers.
 */
import { create } from 'zustand';
import { Student } from '@/data/students';

export interface StudentState {
  students: Student[];
  loading: boolean;
  error: string | null;
  // Actions
  fetchAll: () => Promise<void>;
  add: (student: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addStudent: (student: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, updates: Partial<Student>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  init: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  // -------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------
  students: [],
  loading: false,
  error: null,

  // -------------------------------------------------------------------
  // Data fetching – always maps MongoDB's _id to a stable string `id`
  // -------------------------------------------------------------------
  fetchAll: async () => {
    console.log('🚀 Starting student‑photo migration'); // retained from previous logs for consistency
    console.log('Fetching all students...');
    set({ loading: true, error: null });
    const res = await fetch('/api/students');
    if (res.ok) {
      const data = await res.json();
      console.log('Students API response:', data);
      const studentsArray = data.students || [];
      console.log('Students count:', studentsArray.length);
      const mapped = studentsArray.map((s: any) => ({
        ...s,
        id: s._id ? s._id.toString() : s.id,
      }));
      set({ students: mapped, loading: false, error: null });
      console.log('Fetched', mapped.length, 'students');
    } else {
      const err = await res.text();
      console.error('Failed to fetch students', err);
      set({ loading: false, error: err });
    }
  },

  // -------------------------------------------------------------------
  // CREATE – expose both generic `add` and explicit `addStudent`
  // -------------------------------------------------------------------
  add: async (student) => get().addStudent(student),
  addStudent: async (student) => {
    const secretKey = getSecretKey() || 'dev-secret';
    console.log('Adding student:', student.name, 'with secretKey:', secretKey);
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': secretKey,
      },
      body: JSON.stringify(student),
    });
    console.log('POST /api/students response status:', res.status);
    if (res.ok) {
      await get().fetchAll();
      console.log('Student added successfully');
    } else {
      console.error('Failed to add student', await res.text());
    }
  },

  // -------------------------------------------------------------------
  // UPDATE – expose both generic `update` and explicit `updateStudent`
  // -------------------------------------------------------------------
  update: async (id, updates) => get().updateStudent(id, updates),
  updateStudent: async (id, updates) => {
    const secretKey = getSecretKey();
    console.log('Updating student', id, updates);
    if (!id) {
      console.error('updateStudent called with empty id');
      return;
    }
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(secretKey ? { 'x-secret-key': secretKey } : {}),
      },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await get().fetchAll();
      console.log('Student updated');
    } else {
      console.error('Failed to update student', await res.text());
    }
  },

  // -------------------------------------------------------------------
  // DELETE – expose both generic `delete` and explicit `deleteStudent`
  // -------------------------------------------------------------------
  delete: async (id) => get().deleteStudent(id),
  deleteStudent: async (id) => {
    const secretKey = getSecretKey();
    console.log('Deleting student with id:', id);
    if (!id) {
      console.error('deleteStudent called with empty id');
      return;
    }
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: {
        ...(secretKey ? { 'x-secret-key': secretKey } : {}),
      },
    });
    console.log('DELETE response status:', res.status);
    if (res.ok) {
      await get().fetchAll();
      console.log('Student deletion successful');
    } else {
      const err = await res.text();
      console.error('Failed to delete student', err);
      console.error('DELETE response status:', res.status);
    }
  },

  // -------------------------------------------------------------------
  // Initialization – load data once
  // -------------------------------------------------------------------
  init: () => {
    get().fetchAll();
    console.log('Student store initialized');
  },
}));

// Helper to retrieve the secret key for write operations.
function getSecretKey(): string {
  const { NEXT_PUBLIC_SECRET_KEY, SECRET_KEY } = process.env as any;
  return NEXT_PUBLIC_SECRET_KEY || SECRET_KEY || '';
}
