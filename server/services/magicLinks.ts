import { storage } from "../storage";
import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function create(
  userId: number,
  orbitId: number,
  purpose: 'view_lead' | 'view_conversation' | 'view_intelligence' | 'view_ice',
  targetId?: number,
  expiryDays: number = 7
): Promise<string | null> {
  try {
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    await storage.createMagicLink({
      token,
      userId,
      orbitId,
      purpose,
      targetId: targetId ?? null,
      expiresAt,
    });

    console.log('[magic-links] Created link:', { purpose, userId, orbitId, expiryDays });
    return token;
  } catch (error) {
    console.error('[magic-links] Failed to create link:', {
      userId,
      orbitId,
      purpose,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

export async function validate(
  token: string,
  expectedPurpose?: string
): Promise<{
  valid: boolean;
  userId?: number;
  orbitId?: number;
  targetId?: number;
  purpose?: string;
  error?: string;
}> {
  try {
    const link = await storage.getMagicLink(token);

    if (!link) {
      console.log('[magic-links] Validation failed: Invalid token');
      return { valid: false, error: 'Invalid link' };
    }

    if (new Date() > link.expiresAt) {
      console.log('[magic-links] Validation failed: Expired', { purpose: link.purpose, orbitId: link.orbitId });
      return { valid: false, error: 'Link has expired' };
    }

    if (expectedPurpose && link.purpose !== expectedPurpose) {
      console.log('[magic-links] Validation failed: Purpose mismatch', { expected: expectedPurpose, actual: link.purpose });
      return { valid: false, error: 'Link purpose mismatch' };
    }

    await storage.markMagicLinkUsed(token);

    return {
      valid: true,
      userId: link.userId,
      orbitId: link.orbitId,
      targetId: link.targetId ?? undefined,
      purpose: link.purpose,
    };
  } catch (error) {
    console.error('[magic-links] Validation error:', error instanceof Error ? error.message : String(error));
    return { valid: false, error: 'Validation error' };
  }
}

export async function cleanup(): Promise<number> {
  return storage.cleanupExpiredMagicLinks();
}
