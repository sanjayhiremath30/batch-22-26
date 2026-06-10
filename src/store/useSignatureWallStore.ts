// src/store/useSignatureWallStore.ts
import { create } from 'zustand';
import { SignatureEntry } from '@/data/signatureWall'; // define interface elsewhere

interface SignatureWallState {
  entries: SignatureEntry[];
  fetchAll: () => Promise<void>;
  add: (entry: Omit<SignatureEntry, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, updates: Partial<SignatureEntry>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  init: () => void;
}

export const useSignatureWallStore = create<SignatureWallState>((set, get) => ({
  entries: [],

  fetchAll: async () => {
    const res = await fetch('/api/signatureWall');
    if (res.ok) {
      const data: SignatureEntry[] = await res.json();
      set({ entries: data });
    }
  },

  add: async (entry) => {
    const secretKey = getSecretKey();
    await fetch('/api/signatureWall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-secret-key': secretKey },
      body: JSON.stringify(entry),
    });
  },

  update: async (id, updates) => {
    const secretKey = getSecretKey();
    await fetch(`/api/signatureWall/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-secret-key': secretKey },
      body: JSON.stringify(updates),
    });
  },

  delete: async (id) => {
    const secretKey = getSecretKey();
    await fetch(`/api/signatureWall/${id}`, {
      method: 'DELETE',
      headers: { 'x-secret-key': secretKey },
    });
  },

  init: () => {
    get().fetchAll();
    const source = new EventSource('/api/signatureWall/stream');
    source.onmessage = () => {
      // Re‑fetch on any change – simple and reliable
      get().fetchAll();
    };
    source.onerror = (e) => {
      console.error('SignatureWall SSE error', e);
      source.close();
    };
  },
}));

function getSecretKey(): string {
  const { SECRET_KEY } = process.env as any;
  return SECRET_KEY || '';
}
