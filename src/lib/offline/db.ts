/**
 * Alpha Edu Hub - IndexedDB Offline Storage Manager
 * 
 * Provides type-safe, resilient local storage for:
 * 1. Pending mutation sync queue (e.g. attendance marking)
 * 2. Form drafts auto-preservation
 * 3. Offline roster caching for assigned sections
 */

export interface PendingMutation<T = unknown> {
  id: string; // Unique client mutation UUID
  type: 'MARK_ATTENDANCE' | 'TEACHER_PUNCH' | 'FORM_DRAFT_SUBMIT';
  clientMutationId: string; // Backend idempotency key
  title: string; // Human-readable description (e.g. "Class 8-A Attendance - 2026-01-09")
  payload: T;
  createdAt: string; // ISO string
  updatedAt: string;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  metadata?: Record<string, unknown>;
}

export interface FormDraft<T = unknown> {
  formKey: string;
  data: T;
  lastModified: string;
  expiresAt?: string;
}

export interface CachedRoster {
  sectionId: string;
  sectionName: string;
  cachedAt: string;
  students: Array<{
    id: string;
    admissionNumber: string;
    rollNumber: number | null;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    status?: string;
    remarks?: string | null;
  }>;
}

const DB_NAME = 'AlphaEduHub_OfflineStore';
const DB_VERSION = 1;

class OfflineDB {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  private async getDB(): Promise<IDBDatabase | null> {
    if (!this.isClient()) return null;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Store 1: Pending Mutations Queue
          if (!db.objectStoreNames.contains('pending_mutations')) {
            const mutationStore = db.createObjectStore('pending_mutations', { keyPath: 'id' });
            mutationStore.createIndex('status', 'status', { unique: false });
            mutationStore.createIndex('type', 'type', { unique: false });
            mutationStore.createIndex('clientMutationId', 'clientMutationId', { unique: true });
            mutationStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          // Store 2: Form Drafts Auto-Save
          if (!db.objectStoreNames.contains('form_drafts')) {
            db.createObjectStore('form_drafts', { keyPath: 'formKey' });
          }

          // Store 3: Cached Rosters
          if (!db.objectStoreNames.contains('roster_cache')) {
            db.createObjectStore('roster_cache', { keyPath: 'sectionId' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.warn('Failed to open IndexedDB:', request.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB initialization exception:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  // ==========================================
  // 1. MUTATION QUEUE OPERATIONS
  // ==========================================

  async enqueueMutation<T>(mutation: Omit<PendingMutation<T>, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'attempts' | 'maxAttempts'> & { id?: string }): Promise<PendingMutation<T> | null> {
    const db = await this.getDB();
    if (!db) return null;

    const record: PendingMutation<T> = {
      id: mutation.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`),
      type: mutation.type,
      clientMutationId: mutation.clientMutationId,
      title: mutation.title,
      payload: mutation.payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'PENDING',
      attempts: 0,
      maxAttempts: 4,
      metadata: mutation.metadata,
    };

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('pending_mutations', 'readwrite');
        const store = tx.objectStore('pending_mutations');
        const req = store.put(record);

        req.onsuccess = () => {
          this.notifyMutationListeners();
          resolve(record);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async getAllPendingMutations(): Promise<PendingMutation[]> {
    const db = await this.getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('pending_mutations', 'readonly');
        const store = tx.objectStore('pending_mutations');
        const req = store.getAll();

        req.onsuccess = () => {
          const items = (req.result as PendingMutation[]) || [];
          // Sort by creation time (FIFO)
          items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          resolve(items);
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async getPendingCount(): Promise<number> {
    const items = await this.getAllPendingMutations();
    return items.filter((m) => m.status === 'PENDING' || m.status === 'SYNCING' || m.status === 'FAILED').length;
  }

  async updateMutationStatus(
    id: string,
    status: PendingMutation['status'],
    lastError?: string
  ): Promise<boolean> {
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('pending_mutations', 'readwrite');
        const store = tx.objectStore('pending_mutations');
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const item = getReq.result as PendingMutation | undefined;
          if (!item) {
            resolve(false);
            return;
          }

          item.status = status;
          item.updatedAt = new Date().toISOString();
          if (status === 'SYNCING') {
            item.attempts += 1;
          }
          if (lastError !== undefined) {
            item.lastError = lastError;
          }

          const putReq = store.put(item);
          putReq.onsuccess = () => {
            this.notifyMutationListeners();
            resolve(true);
          };
          putReq.onerror = () => resolve(false);
        };
        getReq.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async removeMutation(id: string): Promise<boolean> {
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('pending_mutations', 'readwrite');
        const store = tx.objectStore('pending_mutations');
        const req = store.delete(id);

        req.onsuccess = () => {
          this.notifyMutationListeners();
          resolve(true);
        };
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async purgeSyncedMutations(olderThanMs: number = 60_000): Promise<number> {
    const db = await this.getDB();
    if (!db) return 0;

    const items = await this.getAllPendingMutations();
    const now = Date.now();
    let purged = 0;

    for (const item of items) {
      if (item.status === 'SYNCED') {
        const updatedTime = new Date(item.updatedAt).getTime();
        if (now - updatedTime > olderThanMs) {
          await this.removeMutation(item.id);
          purged++;
        }
      }
    }

    return purged;
  }

  // ==========================================
  // 2. FORM DRAFTS AUTO-SAVE
  // ==========================================

  async saveFormDraft<T>(formKey: string, data: T, ttlHours: number = 72): Promise<boolean> {
    const db = await this.getDB();
    if (!db) return false;

    const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();
    const draft: FormDraft<T> = {
      formKey,
      data,
      lastModified: new Date().toISOString(),
      expiresAt,
    };

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('form_drafts', 'readwrite');
        const store = tx.objectStore('form_drafts');
        const req = store.put(draft);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async getFormDraft<T>(formKey: string): Promise<T | null> {
    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('form_drafts', 'readonly');
        const store = tx.objectStore('form_drafts');
        const req = store.get(formKey);

        req.onsuccess = () => {
          const result = req.result as FormDraft<T> | undefined;
          if (!result) {
            resolve(null);
            return;
          }
          if (result.expiresAt && new Date(result.expiresAt).getTime() < Date.now()) {
            this.deleteFormDraft(formKey);
            resolve(null);
            return;
          }
          resolve(result.data);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async deleteFormDraft(formKey: string): Promise<boolean> {
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('form_drafts', 'readwrite');
        const store = tx.objectStore('form_drafts');
        const req = store.delete(formKey);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  // ==========================================
  // 3. ROSTER CACHE
  // ==========================================

  async cacheRoster(roster: CachedRoster): Promise<boolean> {
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('roster_cache', 'readwrite');
        const store = tx.objectStore('roster_cache');
        const req = store.put(roster);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async getCachedRoster(sectionId: string): Promise<CachedRoster | null> {
    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('roster_cache', 'readonly');
        const store = tx.objectStore('roster_cache');
        const req = store.get(sectionId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  // ==========================================
  // 4. REACTIVE LISTENERS
  // ==========================================

  private listeners = new Set<() => void>();

  subscribeToMutations(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyMutationListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error notifying mutation listener:', err);
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alphaeduhub:offline-mutations-updated'));
    }
  }
}

export const offlineDb = new OfflineDB();
