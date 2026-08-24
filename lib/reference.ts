import { randomInt } from "crypto";

/**
 * Alphabet for human-readable references.
 *
 * Deliberately excludes characters that get misheard or mistyped when someone
 * reads a reference over the phone: 0/O, 1/I/L, and U (which also avoids
 * accidental rude words). 30 usable characters remain.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const LENGTH = 6;

export const REF_PREFIX = {
  /** Booking inquiry — MR-7K3P9W */
  inquiry: "MR",
  /** Contact / business message — MP-7K3P9W */
  message: "MP",
} as const;

/**
 * A short, readable reference such as `MR-7K3P9W`.
 *
 * Six characters give 30^6 ≈ 729 million combinations, so collisions are
 * effectively impossible at this scale — and the caller retries anyway.
 */
export function newReference(prefix: string): string {
  let body = "";
  for (let i = 0; i < LENGTH; i++) {
    body += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${body}`;
}

/**
 * Runs `create` with a fresh reference, retrying if the database rejects it as
 * a duplicate. Practically never needed, but a booking must never fail because
 * two random strings happened to match.
 */
export async function withUniqueReference<T>(
  prefix: string,
  create: (reference: string) => PromiseLike<T>,  // Prisma returns PrismaPromise
  attempts = 4,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await create(newReference(prefix));
    } catch (err) {
      // P2002 = unique constraint failed. Anything else is a real problem.
      const code = (err as { code?: string })?.code;
      if (code !== "P2002") throw err;
      lastError = err;
    }
  }
  throw lastError;
}
