import { io, Socket } from 'socket.io-client';
import type { Product } from '@/types/product';
import { API_ORIGIN } from './config';

export interface BatchAddedPayload {
  products: Product[];
  stats: { total: number; generated: number };
}

export interface GeneratorStatusPayload {
  status: 'started' | 'stopped';
  intervalMs: number;
  batchSize: number;
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Socket.IO uses the http(s) origin, not ws://
    socket = io(API_ORIGIN, {
      transports: ['polling', 'websocket'], // Trebuie să fie ambele
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => console.log('[WS] Connected:', socket!.id));
    socket.on('disconnect', (reason) => console.log('[WS] Disconnected:', reason));
    socket.on('connect_error', (err) => console.warn('[WS] Error:', err.message));
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function onBatchAdded(cb: (payload: BatchAddedPayload) => void) {
  const s = getSocket();
  s.on('products:batch-added', cb);
  return () => s.off('products:batch-added', cb);
}

export function onGeneratorStatus(cb: (payload: GeneratorStatusPayload) => void) {
  const s = getSocket();
  s.on('generator:status', cb);
  return () => s.off('generator:status', cb);
}
