/**
 * SERVER ONLY — password gate for NDA projects.
 *
 * The password itself never reaches the browser: the client posts a candidate
 * to /api/nda/unlock and only gets back a signed, httpOnly cookie. The cookie
 * carries its own expiry inside the signature, so a visitor cannot extend the
 * session by editing it.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const NDA_COOKIE = "nda_access";
/** how long one unlock lasts */
export const UNLOCK_MINUTES = 30;

function secret(): string {
  const s = process.env.NDA_SECRET;
  if (!s) throw new Error("NDA_SECRET is not set (see .env.example)");
  return s;
}

const sha = (v: string) => createHash("sha256").update(v).digest();

/** Constant-time compare against NDA_PASSWORD; hashing first hides the length. */
export function checkPassword(input: string): boolean {
  const pw = process.env.NDA_PASSWORD;
  if (!pw) return false;
  return timingSafeEqual(sha(input), sha(pw));
}

/** token = "<expiryMs>.<hmac>" */
export function signToken(exp: number): string {
  const sig = createHmac("sha256", secret()).update(String(exp)).digest("hex");
  return `${exp}.${sig}`;
}

/** Returns the expiry when the token is valid and unexpired, else null. */
export function verifyToken(token: string | undefined): number | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const expRaw = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Date.now()) return null;

  const expected = createHmac("sha256", secret()).update(expRaw).digest("hex");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return exp;
}
