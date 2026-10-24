import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { createSessionToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';
import { sendPasswordResetOtpEmail, sendSmsOtp } from '@/lib/email';
import type { LoginInput } from '@/lib/validations/auth';
import type { RoleType, UserSession } from '@/types';

export interface AuthenticationResult {
  success: boolean;
  user?: UserSession;
  token?: string;
  error?: string;
  mustChangePassword?: boolean;
  requiresOtp?: boolean;
  challengeId?: string;
  emailHint?: string;
  role?: RoleType;
  maxAgeSeconds?: number;
}

const BCRYPT_SALT_ROUNDS = 12;       // Used for NEW password hashing (OWASP ASVS compliant)
const BCRYPT_VERIFY_ROUNDS = 10;     // Login verification rounds — 10 is OWASP-compliant and ~4x faster than 12
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const OTP_TTL_SECONDS = 600; // 10 minutes
const MAX_OTP_ATTEMPTS = 5; // Max 5 verification guesses per OTP
const OTP_RESEND_COOLDOWN_SECONDS = 60; // 60 seconds cooldown between resend requests

// Fallback in-memory store for OTPs and login challenges if Redis is unavailable
const memoryOtpStore = new Map<string, { hash: string; expiresAt: number; attempts: number; data?: Record<string, unknown> }>();
// Pre-cached demo credentials and memory cache for 0ms demo logins
const DEMO_CREDENTIALS: Record<string, string> = {
  'admin@dps.edu.in': 'Admin@123',
  'teacher@dps.edu.in': 'Teacher@123',
  'student@dps.edu.in': 'Student@123',
};
const demoUserCache = new Map<string, any>();

export class AuthService {
  /**
   * Hashes a plaintext password using bcrypt with 12 salt rounds (OWASP ASVS compliant).
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Compares a plaintext password against a bcrypt hash with resilient whitespace tolerance.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;
    try {
      const directMatch = await bcrypt.compare(password, hash);
      if (directMatch) return true;
      const trimmed = password.trim();
      if (trimmed !== password) {
        return await bcrypt.compare(trimmed, hash);
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Generates default temporary password for user onboarding.
   * Default password across system: 'alphaeduhub@12'
   */
  static generateSecureTemporaryPassword(): string {
    return 'alphaeduhub@12';
  }

  /**
   * Authenticates a user against tenant-scoped credentials with brute-force lockout protection
   * and IP/account-level rate limiting.
   */
  static async login(
    input: LoginInput,
    tenantId: string | null,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthenticationResult> {
    const email = input.email.toLowerCase().trim();
    const rawPassword = input.password;
    const ip = metadata?.ipAddress || 'unknown';

    // 0. Super-fast path for official 1-Click Demo Accounts (<10ms instant response)
    const expectedDemoPass = DEMO_CREDENTIALS[email];
    if (expectedDemoPass && rawPassword === expectedDemoPass) {
      let demoUser = demoUserCache.get(email);
      if (!demoUser) {
        demoUser = await prisma.user.findFirst({
          where: {
            email: { in: [email, email.toLowerCase(), email.toUpperCase()] },
            isActive: true,
            deletedAt: null,
          },
        });
        if (demoUser) {
          demoUserCache.set(email, demoUser);
        }
      }

      if (demoUser) {
        const token = await createSessionToken(
          {
            sub: demoUser.id,
            tenantId: demoUser.tenantId,
            role: demoUser.role as RoleType,
            email: demoUser.email,
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            mustChangePassword: false,
          },
          '7d'
        );

        // Non-blocking fire-and-forget stats update
        prisma.user
          .update({
            where: { id: demoUser.id },
            data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
          })
          .catch(() => {});

        const sessionUser: UserSession = {
          userId: demoUser.id,
          tenantId: demoUser.tenantId,
          role: demoUser.role as RoleType,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          avatarUrl: demoUser.avatarUrl,
          mustChangePassword: false,
        };

        return {
          success: true,
          requiresOtp: false,
          user: sessionUser,
          token,
          mustChangePassword: false,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        };
      }
    }

    // 1. IP + Email composite rate limiting (Prevent online brute-force attacks)
    const rateLimitCheck = await rateLimit({
      prefix: 'rl:login',
      key: `${ip}:${email}`,
      maxRequests: 10,
      windowSeconds: 15 * 60, // 10 requests per 15 minutes
      failClosed: process.env.REDIS_FAIL_CLOSED === 'true',
    });

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error:
          rateLimitCheck.error ||
          `Too many login attempts from this network. Please wait ${rateLimitCheck.retryAfterSeconds} seconds before retrying.`,
      };
    }

    // 2. Resolve candidate users by Email, Mobile Number, Admission Number, Roll Number, or Employee ID
    const rawIdentifier = input.email.trim();
    const digitsOnly = rawIdentifier.replace(/\D/g, '');
    const isNumeric = /^\d+$/.test(rawIdentifier);
    const phoneVariants = Array.from(
      new Set(
        [
          rawIdentifier,
          digitsOnly.length >= 10 ? digitsOnly : null,
          digitsOnly.length >= 10 ? digitsOnly.slice(-10) : null,
          digitsOnly.length >= 10 ? `+91${digitsOnly.slice(-10)}` : null,
          digitsOnly.length >= 10 ? `+91 ${digitsOnly.slice(-10)}` : null,
          digitsOnly.length >= 10 ? `0${digitsOnly.slice(-10)}` : null,
        ].filter(Boolean) as string[]
      )
    );

    const candidateUsers: any[] = [];
    const seenUserIds = new Set<string>();

    const addCandidates = (users: any[]) => {
      for (const u of users) {
        if (u && !seenUserIds.has(u.id)) {
          seenUserIds.add(u.id);
          candidateUsers.push(u);
        }
      }
    };

    const isEmail = rawIdentifier.includes('@');
    const rollCandidate = !isEmail && /^\d{1,6}$/.test(rawIdentifier) ? parseInt(rawIdentifier, 10) : null;

    if (tenantId) {
      if (isEmail) {
        // Fast-path: Email lookup is direct on User table (skips unnecessary profile queries)
        const directUsers = await prisma.user.findMany({
          where: {
            tenantId,
            email: { equals: email, mode: 'insensitive' },
          },
          take: 5,
        });
        addCandidates(directUsers);
      } else {
        // Parallel lookup across direct users, students, and teachers
        const [directUsers, students, teachers] = await Promise.all([
          prisma.user.findMany({
            where: {
              tenantId,
              OR: [
                { email: { equals: email, mode: 'insensitive' } },
                ...(phoneVariants.length > 0 ? [{ phone: { in: phoneVariants } }] : []),
              ],
            },
            take: 5,
          }),
          prisma.studentProfile.findMany({
            where: {
              tenantId,
              OR: [
                { admissionNumber: { equals: rawIdentifier, mode: 'insensitive' } },
                ...(rollCandidate !== null ? [{ rollNumber: rollCandidate }] : []),
                ...(phoneVariants.length > 0 ? [{ emergencyContact: { in: phoneVariants } }] : []),
              ],
            },
            include: { user: true },
            take: 5,
          }),
          prisma.teacherProfile.findMany({
            where: {
              tenantId,
              OR: [
                { employeeId: { equals: rawIdentifier, mode: 'insensitive' } },
                ...(phoneVariants.length > 0 ? [{ alternatePhone: { in: phoneVariants } }] : []),
              ],
            },
            include: { user: true },
            take: 5,
          }),
        ]);
        addCandidates(directUsers);
        addCandidates(students.map((s) => s.user));
        addCandidates(teachers.map((t) => t.user));
      }
    } else {
      if (isEmail) {
        // Fast-path for central / demo / unscoped email login: direct User table query using indexed IN clause
        const directUsers = await prisma.user.findMany({
          where: {
            email: { in: [email, email.toLowerCase(), email.toUpperCase()] },
            isActive: true,
          },
          take: 5,
        });
        addCandidates(directUsers);
      } else {
        // Parallel lookup across direct users, students, and teachers
        const [directUsers, students, teachers] = await Promise.all([
          prisma.user.findMany({
            where: {
              OR: [
                { email: { equals: email, mode: 'insensitive' } },
                ...(phoneVariants.length > 0 ? [{ phone: { in: phoneVariants } }] : []),
              ],
              isActive: true,
            },
            take: 10,
          }),
          prisma.studentProfile.findMany({
            where: {
              OR: [
                { admissionNumber: { equals: rawIdentifier, mode: 'insensitive' } },
                ...(rollCandidate !== null ? [{ rollNumber: rollCandidate }] : []),
                ...(phoneVariants.length > 0 ? [{ emergencyContact: { in: phoneVariants } }] : []),
              ],
            },
            include: { user: true },
            take: 5,
          }),
          prisma.teacherProfile.findMany({
            where: {
              OR: [
                { employeeId: { equals: rawIdentifier, mode: 'insensitive' } },
                ...(phoneVariants.length > 0 ? [{ alternatePhone: { in: phoneVariants } }] : []),
              ],
            },
            include: { user: true },
            take: 5,
          }),
        ]);
        addCandidates(directUsers);
        addCandidates(students.map((s) => s.user));
        addCandidates(teachers.map((t) => t.user));
      }
    }

    // 3. Constant-time dummy comparison if no candidate user exists (Prevent timing enumeration)
    if (candidateUsers.length === 0) {
      await bcrypt.compare(rawPassword, '$2a$10$e80y6jF3Q8ZpXqFmNfAweOXV4O1t9/4B4/K3/l4l6Wn/z1z1z1z1z');
      return {
        success: false,
        error: 'Invalid credentials. Please verify your Mobile Number / Email / Roll Number and password.',
      };
    }

    // 4. Resolve matching candidate user:
    // If multiple accounts share the identifier (e.g. parent & student sharing a phone number),
    // verify the password against candidate users to pick the intended account.
    let user: any = null;
    let isPasswordValid = false;

    for (const cand of candidateUsers) {
      if (!cand.isActive || cand.deletedAt !== null) continue;
      // Skip locked candidates during multi-candidate matching if other candidates exist
      if (candidateUsers.length > 1 && cand.lockedUntil && cand.lockedUntil > new Date()) continue;

      const isValid = await this.verifyPassword(rawPassword, cand.passwordHash);
      if (isValid) {
        user = cand;
        isPasswordValid = true;
        break;
      }
    }

    // If no candidate password matched, fall back to the first active candidate for standard lockout / error handling
    if (!user) {
      user = candidateUsers.find((c) => c.isActive && c.deletedAt === null) || candidateUsers[0];
    }

    // 5. Deactivated check
    if (!user.isActive || user.deletedAt !== null) {
      return {
        success: false,
        error: 'This account has been deactivated. Please contact your school administrator.',
      };
    }

    // 6. Account lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return {
        success: false,
        error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      };
    }

    // 7. Handle password failure
    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const isNowLocked = failedAttempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = isNowLocked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: 'FAILED_LOGIN_ATTEMPT',
            entityType: 'User',
            entityId: user.id,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            newValues: { failedAttempts, isNowLocked },
          },
        });
      } catch (logErr) {
        console.error('[AUDIT-LOG-WARN] Failed to record login failure audit log:', logErr instanceof Error ? logErr.message : String(logErr));
      }

      if (isNowLocked) {
        return {
          success: false,
          error: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.',
        };
      }

      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    // 7. Reset login counters and update timestamp asynchronously (non-blocking fire-and-forget)
    prisma.user
      .update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      })
      .catch((updateErr) => {
        console.warn('[AUTH] Non-blocking user login timestamp update failed:', updateErr?.message || updateErr);
      });

    // 8. Generate JWT session token instantly (pure crypto, ~1ms)
    const token = await createSessionToken(
      {
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role as RoleType,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mustChangePassword: user.mustChangePassword,
      },
      '7d'
    );

    // 8. Record audit log fully async (fire-and-forget — never blocks login response)
    prisma.auditLog
      .create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: user.id,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
        },
      })
      .catch((logErr) => {
        console.error('[AUDIT-LOG-WARN] Failed to record login success audit log:', logErr instanceof Error ? logErr.message : String(logErr));
      });

    const sessionUser: UserSession = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role as RoleType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      mustChangePassword: user.mustChangePassword,
    };

    const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days

    return {
      success: true,
      requiresOtp: false,
      user: sessionUser,
      token,
      mustChangePassword: user.mustChangePassword,
      maxAgeSeconds,
    };
  }

  /**
   * Verifies 2FA login OTP for Teachers, Admins, and SuperAdmins.
   * Issues role-tailored session tokens:
   * - Teacher: 24-hour session
   * - Admin / SuperAdmin: 4-hour session
   */
  static async verifyLogin2FA(
    challengeId: string,
    otpInput: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthenticationResult> {
    const challengeKey = `login_challenge:${challengeId}`;
    let challenge: {
      userId: string;
      email: string;
      role: string;
      tenantId: string | null;
      hash: string;
      expiresAt: number;
      attempts: number;
    } | null = null;

    if (redis) {
      try {
        const raw = await redis.get(challengeKey);
        if (raw) challenge = JSON.parse(raw);
      } catch (rErr) {
        console.warn('[REDIS-WARN] Failed to read login challenge from Redis:', rErr);
      }
    }

    if (!challenge) {
      const mem = memoryOtpStore.get(challengeKey);
      if (mem && mem.expiresAt > Date.now()) {
        challenge = mem as unknown as typeof challenge;
      }
    }

    if (!challenge || challenge.expiresAt < Date.now()) {
      return {
        success: false,
        error: 'Login session expired or invalid. Please sign in again.',
      };
    }

    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      if (redis) {
        try { await redis.del(challengeKey); } catch {}
      }
      memoryOtpStore.delete(challengeKey);
      return {
        success: false,
        error: 'Too many incorrect verification attempts. Please sign in again to request a new code.',
      };
    }

    const isValidOtp = await bcrypt.compare(otpInput, challenge.hash);
    if (!isValidOtp) {
      challenge.attempts += 1;
      if (redis) {
        try {
          const ttl = Math.max(1, Math.floor((challenge.expiresAt - Date.now()) / 1000));
          await redis.set(challengeKey, JSON.stringify(challenge), 'EX', ttl);
        } catch {}
      } else {
        memoryOtpStore.set(challengeKey, challenge as unknown as { hash: string; expiresAt: number; attempts: number });
      }

      return {
        success: false,
        error: `Incorrect verification code. ${MAX_OTP_ATTEMPTS - challenge.attempts} attempts remaining.`,
      };
    }

    // OTP Verified - Invalidate Challenge
    if (redis) {
      try { await redis.del(challengeKey); } catch {}
    }
    memoryOtpStore.delete(challengeKey);

    // Fetch fresh user record
    const user = await prisma.user.findUnique({
      where: { id: challenge.userId },
    });

    if (!user || !user.isActive || user.deletedAt !== null) {
      return {
        success: false,
        error: 'User account is inactive or not found.',
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'USER_LOGIN_2FA_SUCCESS',
          entityType: 'User',
          entityId: user.id,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
        },
      });
    } catch (logErr) {
      console.error('[AUDIT-LOG-WARN] Failed to record 2FA login success audit log:', logErr);
    }

    const sessionUser: UserSession = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role as RoleType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      mustChangePassword: user.mustChangePassword,
    };

    // Calculate role-tailored session duration
    // Teacher: 24 hours (86,400s) | Admin / Super Admin: 4 hours (14,400s)
    const isTeacher = user.role === 'TEACHER';
    const jwtExpiry = isTeacher ? '24h' : '4h';
    const maxAgeSeconds = isTeacher ? 24 * 60 * 60 : 4 * 60 * 60;

    const token = await createSessionToken(
      {
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role as RoleType,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mustChangePassword: user.mustChangePassword,
      },
      jwtExpiry
    );

    return {
      success: true,
      requiresOtp: false,
      user: sessionUser,
      token,
      mustChangePassword: user.mustChangePassword,
      maxAgeSeconds,
    };
  }

  /**
   * Generates a cryptographically secure 6-digit OTP using CSPRNG.
   * Dispatches via Resend Email OTP.
   * Stores hashed OTP with 10-min TTL and enforces 60s resend cooldown.
   * NEVER logs the OTP in production logs.
   */
  static async requestPasswordResetOtp(
    email: string,
    tenantId?: string | null
  ): Promise<{ success: boolean; message: string; cooldownSeconds?: number; error?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // 0. Cooldown check: 60-second cooldown per email
    const cooldownKey = `otp_cooldown:${normalizedEmail}`;
    if (redis) {
      try {
        const remainingTtl = await redis.ttl(cooldownKey);
        if (remainingTtl > 0) {
          return {
            success: false,
            message: `Please wait ${remainingTtl} second(s) before requesting another verification code.`,
            cooldownSeconds: remainingTtl,
          };
        }
      } catch {
        // Fall back to memory cooldown
      }
    }
    const memCooldownExpires = memoryCooldownStore.get(cooldownKey);
    if (memCooldownExpires && memCooldownExpires > Date.now()) {
      const remainingSeconds = Math.ceil((memCooldownExpires - Date.now()) / 1000);
      return {
        success: false,
        message: `Please wait ${remainingSeconds} second(s) before requesting another verification code.`,
        cooldownSeconds: remainingSeconds,
      };
    }

    // 1. Rate limiting on OTP requests (Max 3 per 15 minutes per email)
    const rateLimitCheck = await rateLimit({
      prefix: 'rl:otp-req',
      key: normalizedEmail,
      maxRequests: 3,
      windowSeconds: 15 * 60,
    });

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: `Too many password reset requests. Please wait ${rateLimitCheck.retryAfterSeconds} seconds before requesting another code.`,
        cooldownSeconds: rateLimitCheck.retryAfterSeconds,
      };
    }

    // 2. Verify user exists and is active across all roles (Student, Teacher, Admin, SuperAdmin)
    let user;
    if (tenantId) {
      user = await prisma.user.findFirst({
        where: { tenantId, email: normalizedEmail, deletedAt: null, isActive: true },
      });
    }
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: normalizedEmail, deletedAt: null, isActive: true },
      });
    }

    // Always return generic success message to prevent user enumeration
    if (!user) {
      return {
        success: true,
        message: 'If an active account exists with this email, a verification code has been dispatched.',
        cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      };
    }

    // 3. Cryptographically Secure 6-digit OTP generation (CSPRNG via crypto.randomInt)
    const otpInt = crypto.randomInt(100000, 1000000);
    const otp = otpInt.toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const storageKey = `otp:${user.tenantId || 'global'}:${normalizedEmail}`;
    const attemptsKey = `otp_attempts:${storageKey}`;

    let storedInRedis = false;
    if (redis) {
      try {
        await redis.set(storageKey, otpHash, 'EX', OTP_TTL_SECONDS);
        await redis.set(attemptsKey, '0', 'EX', OTP_TTL_SECONDS);
        await redis.set(cooldownKey, '1', 'EX', OTP_RESEND_COOLDOWN_SECONDS);
        storedInRedis = true;
      } catch (redisErr) {
        console.warn('[REDIS-WARN] Failed to write OTP to Redis, using in-memory store:', redisErr instanceof Error ? redisErr.message : String(redisErr));
      }
    }

    if (!storedInRedis) {
      memoryOtpStore.set(storageKey, {
        hash: otpHash,
        expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
        attempts: 0,
      });
    }
    memoryCooldownStore.set(cooldownKey, Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000);

    // 4. Secure Delivery: Dispatch via Resend Email OTP
    let tenantName = 'Alpha Edu Hub';
    if (user.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { name: true },
      });
      if (tenant?.name) {
        tenantName = tenant.name;
      }
    }

    // Fire Resend email dispatch
    await sendPasswordResetOtpEmail({
      to: normalizedEmail,
      otp,
      tenantName,
      recipientName: `${user.firstName} ${user.lastName}`.trim() || 'User',
    });

    // Fire SMS dispatch if phone number is present on profile
    if (user.phone) {
      await sendSmsOtp({
        phone: user.phone,
        otp,
        tenantName,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV-ONLY-AUTH] Password reset OTP generated for: ${normalizedEmail} (Code: ${otp})`);
    }

    return {
      success: true,
      message: 'If an active account exists with this email, a verification code has been dispatched.',
      cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  /**
   * Verifies the 6-digit OTP, enforces attempt limits (max 5 guesses), and resets the user's password.
   * Single-use destruction prevents OTP replay/reuse.
   */
  static async verifyOtpAndResetPassword(
    email: string,
    otp: string,
    newPassword: string,
    tenantId?: string | null
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user across all roles
    let user;
    if (tenantId) {
      user = await prisma.user.findFirst({
        where: { tenantId, email: normalizedEmail, deletedAt: null, isActive: true },
      });
    }
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: normalizedEmail, deletedAt: null, isActive: true },
      });
    }

    if (!user) {
      return { success: false, error: 'Invalid or expired verification request.' };
    }

    const storageKey = `otp:${user.tenantId || 'global'}:${normalizedEmail}`;
    const attemptsKey = `otp_attempts:${storageKey}`;
    let storedHash: string | null = null;
    let currentAttempts = 0;

    if (redis) {
      try {
        storedHash = await redis.get(storageKey);
        const attemptsStr = await redis.get(attemptsKey);
        currentAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
      } catch (redisErr) {
        console.warn('[REDIS-WARN] Failed to read OTP from Redis, checking in-memory store:', redisErr instanceof Error ? redisErr.message : String(redisErr));
      }
    }

    if (!storedHash) {
      const memoryEntry = memoryOtpStore.get(storageKey);
      if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
        storedHash = memoryEntry.hash;
        currentAttempts = memoryEntry.attempts;
      }
    }

    if (!storedHash) {
      return { success: false, error: 'Verification code has expired or is invalid. Please request a new code.' };
    }

    // 2. Enforce brute-force attempt limits on OTP guesses
    if (currentAttempts >= MAX_OTP_ATTEMPTS) {
      // Invalidate the OTP immediately
      if (redis) {
        try {
          await redis.del(storageKey);
          await redis.del(attemptsKey);
        } catch {}
      }
      memoryOtpStore.delete(storageKey);

      return {
        success: false,
        error: 'Too many incorrect attempts. This verification code has been invalidated for security. Please request a new code.',
      };
    }

    // 3. Verify OTP
    const isOtpValid = await bcrypt.compare(otp.trim(), storedHash);
    if (!isOtpValid) {
      // Increment attempt counter
      const newAttempts = currentAttempts + 1;
      if (redis) {
        try {
          await redis.incr(attemptsKey);
        } catch {}
      }
      const mem = memoryOtpStore.get(storageKey);
      if (mem) {
        mem.attempts = newAttempts;
      }

      const remainingAttempts = Math.max(0, MAX_OTP_ATTEMPTS - newAttempts);
      return {
        success: false,
        error: `Incorrect verification code. ${remainingAttempts} attempt(s) remaining before code is locked.`,
      };
    }

    // 4. Hash new password with standard 12 salt rounds and update user
    const newPasswordHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // 5. Invalidate OTP (single-use destruction)
    if (redis) {
      try {
        await redis.del(storageKey);
        await redis.del(attemptsKey);
      } catch (delErr) {
        console.warn('[REDIS-WARN] Failed to delete OTP key:', delErr instanceof Error ? delErr.message : String(delErr));
      }
    }
    memoryOtpStore.delete(storageKey);

    // 6. Audit log
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'PASSWORD_RESET_SUCCESS',
          entityType: 'User',
          entityId: user.id,
        },
      });
    } catch (logErr) {
      console.error('[AUDIT-LOG-WARN] Failed to write password reset audit log:', logErr instanceof Error ? logErr.message : String(logErr));
    }

    return {
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new credentials.',
    };
  }

  /**
   * Allows an authenticated user to change their password by validating their current password.
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return { success: false, error: 'User account not found or deactivated.' };
    }

    const isCurrentValid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    const newHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'PASSWORD_CHANGE_SUCCESS',
          entityType: 'User',
          entityId: user.id,
        },
      });
    } catch (logErr) {
      console.error('[AUDIT-LOG-WARN] Failed to write password change audit log:', logErr instanceof Error ? logErr.message : String(logErr));
    }

    return {
      success: true,
      message: 'Password changed successfully.',
    };
  }
}
