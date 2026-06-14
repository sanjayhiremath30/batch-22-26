import { create } from 'zustand';

export interface BestMemory {
  id: string; // mapped from _id
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  images: string[];
  date?: string; // Optional user-provided date
  createdAt: string; // ISO date string
}

interface BestMemoriesState {
  memories: BestMemory[];
  fetchAll: () => Promise<void>;
  addMemory: (memory: Omit<BestMemory, 'id' | 'createdAt'>, submissionKey: string) => Promise<void>;
  deleteMemory: (id: string, secretKey?: string) => Promise<void>;
  init: () => void;
}

export const useBestMemoriesStore = create<BestMemoriesState>((set, get) => ({
  memories: [],

  fetchAll: async () => {
    console.log('Fetching all best memories...');
    const res = await fetch('/api/memories');
    if (res.ok) {
      const data = await res.json();
      const mapped = data.map((m: any) => ({
        ...m,
        id: m._id ? m._id.toString() : m.id,
      }));
      set({ memories: mapped });
      console.log('Fetched', mapped.length, 'memories');
    } else {
      console.error('Failed to fetch best memories');
    }
  },

  addMemory: async (memory, submissionKey) => {
    console.log('Adding best memory...');
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': submissionKey,
      },
      body: JSON.stringify(memory),
    });
    if (res.ok) {
      await get().fetchAll();
      console.log('Best memory added successfully');
    } else {
      console.error('Failed to add memory', await res.text());
      throw new Error('Failed to upload memory. Please check your submission key.');
    }
  },

  deleteMemory: async (id, secretKey) => {
    console.log('Deleting best memory:', id);
    const key = secretKey || getSecretKey();
    const res = await fetch(`/api/memories/${id}`, {
      method: 'DELETE',
      headers: {
        ...(key ? { 'x-secret-key': key } : {}),
      },
    });
    if (res.ok) {
      await get().fetchAll();
      console.log('Memory deletion successful');
    } else {
      console.error('Failed to delete memory', await res.text());
    }
  },

  init: () => {
    get().fetchAll();
  },
}));

function getSecretKey(): string {
  const { NEXT_PUBLIC_SECRET_KEY, SECRET_KEY } = process.env as any;
  return NEXT_PUBLIC_SECRET_KEY || SECRET_KEY || '';
}
