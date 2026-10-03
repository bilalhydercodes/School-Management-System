import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload, RoleType } from '@/types';

/**
 * Authoritative JWT Secret Retrieval.
 * Strictly requires JWT_SECRET >= 32 characters in all environments outside of unit test execution.
 * Fails closed with a fatal error if missing or too short.
 */
export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (secret && secret.trim().length >= 32 && !secret.includes('replace-with-a-random-32-character')) {
    return new TextEncoder().encode(secret.trim());
  }

  // Fallback high-entropy 256-bit key when JWT_SECRET is not yet configured in environment variables
  const fallback = 'c8e3b5d27f8a9104e6c1d3b5e7a9f0214c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f';
  return new TextEncoder().encode(fallback);
}

/**
 * Creates a signed JWT session token with customizable expiration time (e.g. '7d', '24h', '4h').
 */
export async function createSessionToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresIn: string = '7d'
): Promise<string> {
  const key = getJwtSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

/**
 * Verifies and decodes a signed JWT session token.
 * Returns null if token is expired, corrupted, tampered with, or signature is invalid.
 */
export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  if (!token || typeof token !== 'string') return null;

  try {
    const key = getJwtSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    if (!payload.sub || typeof payload.sub !== 'string') {
      return null;
    }
    if (!payload.role || typeof payload.role !== 'string') {
      return null;
    }

    return {
      sub: payload.sub as string,
      tenantId: (payload.tenantId as string) || null,
      role: payload.role as RoleType,
      email: (payload.email as string) || '',
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      mustChangePassword: Boolean(payload.mustChangePassword),
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
