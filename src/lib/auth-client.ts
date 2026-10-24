/**
 * Instant Client-Side Logout
 * 
 * 1. Synchronously clears cookies in document.cookie (0ms)
 * 2. Fires background server logout to clear HTTP-only cookies & revoke session (non-blocking)
 * 3. Immediately navigates to /login
 */
export function performInstantLogout(redirectTo: string = '/login'): void {
  try {
    // Clear known cookie names client-side synchronously
    document.cookie = 'aeh_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  } catch {
    // Non-blocking
  }

  // Notify server asynchronously to revoke session and purge HTTP-only cookies
  try {
    fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(() => {});
  } catch {
    // Non-blocking
  }

  // Instant hard navigation to login page
  if (typeof window !== 'undefined') {
    window.location.replace(redirectTo);
  }
}
