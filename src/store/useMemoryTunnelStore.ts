import { create } from 'zustand';

export interface MemoryEvent {
  id: string; // mapped from _id
  url: string;
  year: string;
  text: string;
}

interface MemoryTunnelState {
  memories: MemoryEvent[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  init: () => void;
  fetchAll: () => Promise<void>;
  addMemory: (memory: Omit<MemoryEvent, 'id'>, secretKey: string) => Promise<void>;
  deleteMemory: (id: string, secretKey: string) => Promise<void>;
}

export const useMemoryTunnelStore = create<MemoryTunnelState>((set, get) => ({
  memories: [],
  loading: false,
  error: null,
  initialized: false,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/memoryTunnel');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((m: any) => ({
          ...m,
          id: m._id ? m._id.toString() : m.id,
        }));
        set({ memories: mapped, loading: false });
      } else {
        set({ loading: false, error: 'Failed to fetch memory tunnel events' });
      }
    } catch (err) {
      set({ loading: false, error: 'Network error fetching memory tunnel events' });
    }
  },

  init: () => {
    if (get().initialized) return;
    get().fetchAll();
    set({ initialized: true });
  },

  addMemory: async (memory, secretKey) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/memoryTunnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-secret-key': secretKey,
        },
        body: JSON.stringify(memory),
      });
      if (res.ok) {
        await get().fetchAll();
      } else {
        const errData = await res.text();
        set({ loading: false, error: errData || 'Failed to add memory' });
      }
    } catch (err) {
      set({ loading: false, error: 'Network error adding memory' });
    }
  },

  deleteMemory: async (id, secretKey) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/memoryTunnel/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': secretKey,
        },
      });
      if (res.ok) {
        await get().fetchAll();
      } else {
        const errData = await res.text();
        set({ loading: false, error: errData || 'Failed to delete memory' });
      }
    } catch (err) {
      set({ loading: false, error: 'Network error deleting memory' });
    }
  },
}));
