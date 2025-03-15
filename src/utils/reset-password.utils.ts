import { randomBytes, createHash } from "crypto";

/**
 * Generate a random token
 * @param length Token length (default: 32)
 * @returns A URL-safe random token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

/**
 * Hash a token using SHA-256
 * @param token Token to hash
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify if a token matches a hash
 * @param plainToken The plain token to verify
 * @param hashedToken The stored hashed token to compare against
 * @returns Whether the token matches the hash
 */
export function verifyToken(plainToken: string, hashedToken: string): boolean {
  return hashToken(plainToken) === hashedToken;
}