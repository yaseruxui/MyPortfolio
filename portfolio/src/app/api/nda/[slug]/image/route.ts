import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NDA_CONTENT } from "@/content/nda.server";
import { NDA_COOKIE, verifyToken } from "@/lib/nda";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Originals live outside /public so they are never served statically. */
const PRIVATE_DIR = path.join(process.cwd(), "private", "work", "nda");

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const jar = await cookies();
  if (verifyToken(jar.get(NDA_COOKIE)?.value) === null) {
    return NextResponse.json({ error: "locked" }, { status: 401 });
  }

  const { slug } = await params;
  const item = NDA_CONTENT[slug];
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // the file name comes from our own map, never from the request
  const file = path.join(PRIVATE_DIR, path.basename(item.file));
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return NextResponse.json({ error: "bad_type" }, { status: 415 });

  try {
    const buf = await readFile(file);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "content-type": type,
        // private: never cached by a CDN or shared proxy
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
