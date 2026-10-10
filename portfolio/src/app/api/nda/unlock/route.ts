import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NDA_COOKIE, UNLOCK_MINUTES, checkPassword, signToken, verifyToken } from "@/lib/nda";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Slows brute force down. Per server instance — good enough for a portfolio. */
const MAX_TRIES = 8;
const WINDOW_MS = 10 * 60_000;
const attempts = new Map<string, { n: number; until: number }>();

const clientId = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

/** Current session state — lets the UI show the countdown after a reload. */
export async function GET() {
  const jar = await cookies();
  const exp = verifyToken(jar.get(NDA_COOKIE)?.value);
  return NextResponse.json(
    { unlocked: exp !== null, expiresAt: exp },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const id = clientId(req);
  const now = Date.now();
  const rec = attempts.get(id);
  if (rec && rec.until > now && rec.n >= MAX_TRIES) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !checkPassword(password)) {
    attempts.set(id, {
      n: rec && rec.until > now ? rec.n + 1 : 1,
      until: now + WINDOW_MS,
    });
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  attempts.delete(id);
  const expiresAt = now + UNLOCK_MINUTES * 60_000;
  const jar = await cookies();
  jar.set(NDA_COOKIE, signToken(expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UNLOCK_MINUTES * 60,
  });
  return NextResponse.json({ unlocked: true, expiresAt });
}
