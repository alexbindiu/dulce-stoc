import { offlineQueue, QueuedMethod } from './offline-queue';

const BASE = `https://${window.location.hostname}:3000/api`;

export function getToken(): string | null {
  return localStorage.getItem('token');
}

type ConnectionListener = (online: boolean) => void;
const listeners: ConnectionListener[] = [];
let _online = navigator.onLine;

export function isOnline(): boolean {
  return _online;
}

export function onConnectionChange(cb: ConnectionListener): () => void {
  listeners.push(cb);
  return () => listeners.splice(listeners.indexOf(cb), 1);
}

function setOnline(value: boolean) {
  if (value === _online) return;
  _online = value;
  listeners.forEach((cb) => cb(value));
}

window.addEventListener('online',  () => setOnline(true));
window.addEventListener('offline', () => setOnline(false));

// Active probe — pings the server every 15 s to detect silent failures
async function probe() {
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'probe@test.com', password: '__probe__' }), // <--- Am schimbat emailul aici
      signal: AbortSignal.timeout(4000),
    });
    setOnline(res.status < 600);
  } catch {
    setOnline(false);
  }
}
setInterval(probe, 15_000);

// ── Core fetch ────────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw Object.assign(new Error(error.message ?? 'Request failed'), { status: res.status, ...error });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Sync queue ────────────────────────────────────────────────────────────────
export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const ops = offlineQueue.getAll();
  let synced = 0;
  let failed = 0;

  for (const op of ops) {
    try {
      await request(op.path, {
        method: op.method,
        body: op.body ? JSON.stringify(op.body) : undefined,
      });
      offlineQueue.remove(op.id);
      synced++;
    } catch (e: any) {
      if (e.status && e.status < 500) {
        offlineQueue.remove(op.id);
        failed++;
      } else {
        break; // network still down — stop replaying
      }
    }
  }

  return { synced, failed };
}

// Auto-sync and notify when connection returns
onConnectionChange((online) => {
  if (online && offlineQueue.size() > 0) {
    syncOfflineQueue().then(({ synced }) => {
      if (synced > 0) {
        window.dispatchEvent(
          new CustomEvent('offline-queue-synced', { detail: { synced } }),
        );
      }
    });
  }
});

// ── Mutation wrapper — queues when offline ────────────────────────────────────
async function safeMutate<T>(
  method: QueuedMethod,
  path: string,
  body?: unknown,
  localId?: string,
): Promise<T | null> {
  if (!isOnline()) {
    offlineQueue.enqueue({ method, path, body, localId });
    return null;
  }

  try {
    const result = await request<T>(path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
    setOnline(true);
    return result;
  } catch (e: any) {
    if (!e.status) {
      // Network error — go offline and queue
      setOnline(false);
      offlineQueue.enqueue({ method, path, body, localId });
      return null;
    }
    throw e;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string)                          => request<T>(path),
  post:   <T>(path: string, body: unknown, localId?: string) => safeMutate<T>('POST',   path, body, localId),
  patch:  <T>(path: string, body: unknown)           => safeMutate<T>('PATCH',  path, body),
  delete: <T>(path: string)                          => safeMutate<T>('DELETE', path),
};
