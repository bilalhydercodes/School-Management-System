'use client';

import { offlineDb, PendingMutation } from './db';
import { markDailyAttendanceAction, markTeacherCheckInAction, markTeacherCheckOutAction } from '@/actions/attendance';
import type { MarkDailyAttendanceInput } from '@/lib/validations/attendance';

export type SyncStatusState = 'idle' | 'syncing' | 'synced' | 'failed';

export interface SyncEngineResult {
  totalProcessed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

class SyncEngine {
  private isSyncing = false;
  private syncListeners = new Set<(status: SyncStatusState, lastResult?: SyncEngineResult) => void>();

  subscribe(callback: (status: SyncStatusState, lastResult?: SyncEngineResult) => void): () => void {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  private notify(status: SyncStatusState, lastResult?: SyncEngineResult) {
    this.syncListeners.forEach((cb) => {
      try {
        cb(status, lastResult);
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('alphaeduhub:sync-status', {
          detail: { status, lastResult },
        })
      );
    }
  }

  /**
   * Main synchronization cycle: processes all pending/failed mutations
   */
  async syncAll(): Promise<SyncEngineResult> {
    if (this.isSyncing) {
      return { totalProcessed: 0, succeeded: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { totalProcessed: 0, succeeded: 0, failed: 0, errors: ['Device is offline'] };
    }

    this.isSyncing = true;
    this.notify('syncing');

    const result: SyncEngineResult = {
      totalProcessed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    try {
      const allMutations = await offlineDb.getAllPendingMutations();
      const itemsToSync = allMutations.filter(
        (m) => m.status === 'PENDING' || m.status === 'FAILED'
      );

      result.totalProcessed = itemsToSync.length;

      for (const mutation of itemsToSync) {
        // Mark as SYNCING
        await offlineDb.updateMutationStatus(mutation.id, 'SYNCING');

        try {
          const success = await this.executeMutation(mutation);

          if (success) {
            await offlineDb.updateMutationStatus(mutation.id, 'SYNCED');
            result.succeeded++;
          } else {
            result.failed++;
            result.errors.push(`Failed to sync: ${mutation.title}`);
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Network error during sync';
          await offlineDb.updateMutationStatus(mutation.id, 'FAILED', errorMsg);
          result.failed++;
          result.errors.push(errorMsg);
        }
      }

      // Purge older synced records to maintain clean local storage
      await offlineDb.purgeSyncedMutations(30_000);

      const finalStatus: SyncStatusState =
        result.failed > 0 ? 'failed' : result.succeeded > 0 ? 'synced' : 'idle';
      this.notify(finalStatus, result);
    } catch (globalErr: unknown) {
      const msg = globalErr instanceof Error ? globalErr.message : 'Global sync failure';
      result.errors.push(msg);
      this.notify('failed', result);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Dispatches the operation to its respective server action
   */
  private async executeMutation(mutation: PendingMutation): Promise<boolean> {
    switch (mutation.type) {
      case 'MARK_ATTENDANCE': {
        const payload = mutation.payload as MarkDailyAttendanceInput;
        // Inject the idempotency clientMutationId
        const enrichedPayload: MarkDailyAttendanceInput = {
          ...payload,
          clientMutationId: mutation.clientMutationId,
        };

        const res = await markDailyAttendanceAction(enrichedPayload);
        if (res.success) {
          return true;
        } else {
          await offlineDb.updateMutationStatus(
            mutation.id,
            'FAILED',
            res.error || 'Server rejected attendance sync'
          );
          return false;
        }
      }

      case 'TEACHER_PUNCH': {
        const payload = mutation.payload as { action: 'CHECK_IN' | 'CHECK_OUT' };
        if (payload.action === 'CHECK_IN') {
          const res = await markTeacherCheckInAction();
          return res.success;
        } else {
          const res = await markTeacherCheckOutAction();
          return res.success;
        }
      }

      default: {
        console.warn(`Unsupported offline mutation type: ${mutation.type}`);
        return false;
      }
    }
  }
}

export const syncEngine = new SyncEngine();
