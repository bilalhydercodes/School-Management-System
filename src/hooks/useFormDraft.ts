'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { offlineDb } from '@/lib/offline/db';

/**
 * Reusable hook to auto-save and restore form drafts in IndexedDB.
 * Prevents loss of form input when connectivity drops or browser is closed.
 */
export function useFormDraft<T>(
  formKey: string,
  initialData: T,
  options?: {
    enabled?: boolean;
    debounceMs?: number;
    onRestored?: (data: T) => void;
  }
) {
  const { enabled = true, debounceMs = 600, onRestored } = options || {};
  const [formData, setFormData] = useState<T>(initialData);
  const [hasDraft, setHasDraft] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstMount = useRef(true);

  // Restore draft on mount
  useEffect(() => {
    if (!enabled || !formKey) {
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const savedDraft = await offlineDb.getFormDraft<T>(formKey);
        if (isMounted && savedDraft) {
          setFormData(savedDraft);
          setHasDraft(true);
          onRestored?.(savedDraft);
        }
      } catch (err) {
        console.warn('Failed to load form draft:', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [formKey, enabled, onRestored]);

  // Debounced auto-save on change
  useEffect(() => {
    if (!enabled || !formKey || isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await offlineDb.saveFormDraft(formKey, formData);
        setHasDraft(true);
      } catch (err) {
        console.warn('Failed to auto-save form draft:', err);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [formData, formKey, enabled, debounceMs]);

  // Clear draft once successfully submitted to backend
  const clearDraft = useCallback(async () => {
    if (!formKey) return;
    try {
      await offlineDb.deleteFormDraft(formKey);
      setHasDraft(false);
    } catch (err) {
      console.warn('Failed to clear form draft:', err);
    }
  }, [formKey]);

  return {
    formData,
    setFormData,
    hasDraft,
    isLoaded,
    clearDraft,
  };
}
