import React, { useEffect, useState } from 'react';
import { isOnline, onConnectionChange } from '@/services/api';
import { offlineQueue } from '@/services/offline-queue';

export function ConnectionBanner() {
  const [online, setOnline]         = useState(isOnline());
  const [syncing, setSyncing]       = useState(false);
  const [pendingCount, setPending]  = useState(offlineQueue.size());
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    const unsub = onConnectionChange((val) => {
      setOnline(val);
      if (val) setSyncing(true);
    });

    const onSynced = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSyncing(false);
      setPending(offlineQueue.size());
      if (detail.synced > 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 3000);
      }
    };

    window.addEventListener('offline-queue-synced', onSynced);
    return () => {
      unsub();
      window.removeEventListener('offline-queue-synced', onSynced);
    };
  }, []);

  // Poll pending count every 2 s
  useEffect(() => {
    const id = setInterval(() => setPending(offlineQueue.size()), 2000);
    return () => clearInterval(id);
  }, []);

  if (online && !syncing && !justSynced && pendingCount === 0) return null;

  if (!online) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        Offline — modificările sunt salvate local
        {pendingCount > 0 && (
          <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">
            {pendingCount} în așteptare
          </span>
        )}
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
        <span className="w-2 h-2 rounded-full bg-white animate-spin" />
        Sincronizare cu serverul…
        {pendingCount > 0 && (
          <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">
            {pendingCount} rămase
          </span>
        )}
      </div>
    );
  }

  if (justSynced) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
        <span>✓</span>
        Sincronizare completă
      </div>
    );
  }

  return null;
}
