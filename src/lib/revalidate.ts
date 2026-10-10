import { revalidatePath } from 'next/cache';
import { invalidateTenantCache } from '@/lib/tenant-cache';

/**
 * Safely triggers Next.js cache revalidation and synchronously clears the in-memory/SWR cache.
 * When called inside Next.js request lifecycle, executes standard revalidation.
 * When called in test runners, background workers, or CLI scripts, gracefully suppresses
 * the missing requestAsyncStorage invariant error.
 */
export function safeRevalidatePath(path: string, type?: 'layout' | 'page'): void {
  try {
    revalidatePath(path, type);
  } catch {
    // Gracefully suppress error when outside Next.js request context
  }

  try {
    if (path.includes('/students')) {
      invalidateTenantCache(undefined, 'students');
      invalidateTenantCache(undefined, 'dashboard');
    } else if (path.includes('/teachers')) {
      invalidateTenantCache(undefined, 'teachers');
      invalidateTenantCache(undefined, 'dashboard');
    } else if (path.includes('/fees')) {
      invalidateTenantCache(undefined, 'fees');
      invalidateTenantCache(undefined, 'dashboard');
    } else if (path.includes('/notices')) {
      invalidateTenantCache(undefined, 'notices');
      invalidateTenantCache(undefined, 'dashboard');
    } else if (path.includes('/calendar') || path.includes('/events') || path.includes('/holidays')) {
      invalidateTenantCache(undefined, 'events');
      invalidateTenantCache(undefined, 'holidays');
      invalidateTenantCache(undefined, 'dashboard');
    } else if (path.includes('/attendance')) {
      invalidateTenantCache(undefined, 'attendance');
      invalidateTenantCache(undefined, 'dashboard');
    } else if (path.includes('/academics') || path.includes('/timetable')) {
      invalidateTenantCache(undefined, 'academics');
      invalidateTenantCache(undefined, 'dashboard');
    } else if (path === '/admin') {
      invalidateTenantCache(undefined, 'dashboard');
    } else if (path === '/') {
      invalidateTenantCache(undefined, 'all');
    }
  } catch {
    // Non-blocking
  }
}
