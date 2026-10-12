export const ADMIN_COOKIE = "mrac_admin";
const SALT = "maximum-admin-v1";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Expected cookie value for the current ADMIN_PASSWORD (null if unset). */
export async function expectedAdminToken(): Promise<string | null> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 8) return null; // refuse trivially weak/missing setup
  return sha256Hex(`${pw}::${SALT}`);
}

/** Constant-time-ish string compare (equal-length hex digests). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function passwordMatches(submitted: string): Promise<boolean> {
  const expected = await expectedAdminToken();
  if (!expected) return false;
  const got = await sha256Hex(`${submitted}::${SALT}`);
  return safeEqual(got, expected);
}

/** Validate a cookie token against the expected value. */
export async function tokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedAdminToken();
  if (!expected) return false;
  return safeEqual(token, expected);
}
