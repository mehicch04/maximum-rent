import { randomInt } from "crypto";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const LENGTH = 6;

export const REF_PREFIX = {
  inquiry: "MR",
  message: "MP",
} as const;

function newReference(prefix: string): string {
  let body = "";
  for (let i = 0; i < LENGTH; i++) {
    body += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${body}`;
}

export async function withUniqueReference<T>(
  prefix: string,
  create: (reference: string) => PromiseLike<T>,
  attempts = 4,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await create(newReference(prefix));
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== "P2002") throw err;
      lastError = err;
    }
  }
  throw lastError;
}
