// src/store/useStudentStore.ts
import { create } from 'zustand';

import { Student } from '@/data/students';

interface StudentState {
  students: Student[];
  fetchAll: () => Promise<void>;
  // Primary CRUD helpers – exported under both generic and explicit names
  add: (student: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addStudent: (student: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, updates: Partial<Student>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  init: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],

  // -------------------------------------------------------------------
  // Data fetching – always maps MongoDB's _id to a stable string `id`
  // -------------------------------------------------------------------
  fetchAll: async () => {
    console.log('Fetching all students...');
    const res = await fetch('/api/students');
    if (res.ok) {
      const data = await res.json();
      const mapped = data.map((s: any) => ({
        ...s,
        id: s._id ? s._id.toString() : (s.id ? s.id : undefined),
      }));
      set({ students: mapped });
      console.log('Fetched', mapped.length, 'students');
    } else {
      console.error('Failed to fetch students', await res.text());
    }
  },

  // -------------------------------------------------------------------
  // CREATE – expose both generic `add` and explicit `addStudent`
  // -------------------------------------------------------------------
  add: async (student) => {
    return get().addStudent(student);
  },
  addStudent: async (student) => {
    // Retrieve secret key; fallback to dev-secret for safety
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
  update: async (id, updates) => {
    return get().updateStudent(id, updates);
  },
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
  delete: async (id) => {
    return get().deleteStudent(id);
  },
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
  // Initialization – load data once, SSE stays disabled
  // -------------------------------------------------------------------
  init: () => {
    get().fetchAll();
    console.log('Student store initialized');
  },
}));

// Helper to retrieve the secret key for write operations.
// Helper to retrieve the secret key for write operations.
function getSecretKey(): string {
  // Use NEXT_PUBLIC_ prefixed env var for client-side access
  const { NEXT_PUBLIC_SECRET_KEY, SECRET_KEY } = process.env as any;
  return NEXT_PUBLIC_SECRET_KEY || SECRET_KEY || '';
}
