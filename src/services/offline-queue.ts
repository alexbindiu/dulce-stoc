export type QueuedMethod = 'POST' | 'PATCH' | 'DELETE';

export interface QueuedOperation {
  id: string;
  method: QueuedMethod;
  path: string;
  body?: unknown;
  timestamp: number;
  localId?: string;
}

const STORAGE_KEY = 'dulcestoc:offline-queue';

function load(): QueuedOperation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOperation[]) : [];
  } catch {
    return [];
  }
}

function save(ops: QueuedOperation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const offlineQueue = {
  getAll(): QueuedOperation[] {
    return load();
  },

  enqueue(op: Omit<QueuedOperation, 'id' | 'timestamp'>): QueuedOperation {
    const full: QueuedOperation = { ...op, id: uuid(), timestamp: Date.now() };
    save([...load(), full]);
    return full;
  },

  remove(id: string): void {
    save(load().filter((op) => op.id !== id));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  size(): number {
    return load().length;
  },
};
