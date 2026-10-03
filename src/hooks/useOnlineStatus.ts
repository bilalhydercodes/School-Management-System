'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineDb, PendingMutation } from '@/lib/offline/db';
import { syncEngine, SyncStatusState, SyncEngineResult } from '@/lib/offline/syncEngine';

export interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  isRestored: boolean;
  pendingCount: number;
  failedCount: number;
  syncStatus: SyncStatusState;
  pendingItems: PendingMutation[];
  syncNow: () => Promise<SyncEngineResult>;
  dismissRestored: () => void;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [pendingItems, setPendingItems] = useState<PendingMutation[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>('idle');

  const refreshPendingMutations = useCallback(async () => {
    try {
      const items = await offlineDb.getAllPendingMutations();
      setPendingItems(items);
    } catch {
      // Ignored during SSR or unmounted
    }
  }, []);

  const dismissRestored = useCallback(() => {
    setIsRestored(false);
  }, []);

  const syncNow = useCallback(async () => {
    return await syncEngine.syncAll();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setIsRestored(true);
        // Automatically sync queued work on reconnect
        syncEngine.syncAll();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setIsRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to DB updates
    const unsubscribeDb = offlineDb.subscribeToMutations(() => {
      refreshPendingMutations();
    });

    // Subscribe to Sync Engine
    const unsubscribeSync = syncEngine.subscribe((status) => {
      setSyncStatus(status);
      refreshPendingMutations();
    });

    refreshPendingMutations();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeDb();
      unsubscribeSync();
    };
  }, [wasOffline, refreshPendingMutations]);

  // Auto-dismiss restored message after 3.5 seconds
  useEffect(() => {
    if (isRestored) {
      const timer = setTimeout(() => {
        setIsRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isRestored]);

  const pendingCount = pendingItems.filter((i) => i.status === 'PENDING' || i.status === 'SYNCING').length;
  const failedCount = pendingItems.filter((i) => i.status === 'FAILED').length;

  return {
    isOnline,
    wasOffline,
    isRestored,
    pendingCount,
    failedCount,
    syncStatus,
    pendingItems,
    syncNow,
    dismissRestored,
  };
}
