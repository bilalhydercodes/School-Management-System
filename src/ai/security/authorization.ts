import { AI_CONFIG } from '../core/config';
import type { RoleType } from '@/types';

// In-memory rate limiting store (user -> timestamps)
const userRequestTimestamps = new Map<string, number[]>();

// Periodic cleanup of stale rate-limit buckets every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - AI_CONFIG.rateLimitWindowMs;
    userRequestTimestamps.forEach((timestamps: number[], key: string) => {
      const valid = timestamps.filter((t: number) => t > cutoff);
      if (valid.length === 0) {
        userRequestTimestamps.delete(key);
      } else {
        userRequestTimestamps.set(key, valid);
      }
    });
  }, 10 * 60 * 1000).unref?.();
}

/**
 * Checks and records rate limit for a specific user ID.
 * Returns true if permitted, false if rate limit exceeded.
 */
export function checkRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowStart = now - AI_CONFIG.rateLimitWindowMs;
  const timestamps = userRequestTimestamps.get(userId) || [];

  // Filter timestamps within current window
  const activeTimestamps = timestamps.filter((t) => t > windowStart);

  if (activeTimestamps.length >= AI_CONFIG.rateLimitMaxRequests) {
    const oldest = activeTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + AI_CONFIG.rateLimitWindowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  activeTimestamps.push(now);
  userRequestTimestamps.set(userId, activeTimestamps);

  return { allowed: true };
}

/**
 * Validates and sanitizes chat input message.
 */
export function validateChatMessage(message: unknown): {
  valid: boolean;
  cleanMessage?: string;
  error?: string;
} {
  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a text string.' };
  }

  const clean = message.trim();

  if (clean.length === 0) {
    return { valid: false, error: 'Message cannot be empty.' };
  }

  if (clean.length > AI_CONFIG.maxMessageLength) {
    return {
      valid: false,
      error: `Message is too long (maximum ${AI_CONFIG.maxMessageLength} characters allowed).`,
    };
  }

  return { valid: true, cleanMessage: clean };
}

/**
 * Resolves default permissions list for an ERP role.
 */
export function getPermissionsForRole(role: RoleType | string): string[] {
  switch (role) {
    case 'STUDENT':
      return ['student:read', 'academics:read', 'attendance:read_self', 'exam:read_self'];
    case 'TEACHER':
      return ['teacher:read', 'attendance:mark', 'class:view', 'timetable:read'];
    case 'PARENT':
      return ['parent:read', 'children:view', 'fee:view', 'attendance:read_children'];
    case 'ACCOUNTANT':
      return ['fee:manage', 'invoice:read', 'reports:read'];
    case 'ADMIN':
      return ['admin:read', 'school:manage', 'users:view', 'reports:full'];
    case 'SUPER_ADMIN':
      return ['superadmin:all', 'platform:manage'];
    default:
      return ['read:public'];
  }
}
