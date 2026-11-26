import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NDA_CONTENT } from "@/content/nda.server";
import { NDA_COOKIE, verifyToken } from "@/lib/nda";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reveals the private link once the unlock cookie checks out. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const jar = await cookies();
  const expiresAt = verifyToken(jar.get(NDA_COOKIE)?.value);
  if (expiresAt === null) {
    return NextResponse.json({ error: "locked" }, { status: 401 });
  }

  const { slug } = await params;
  const item = NDA_CONTENT[slug];
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json(
    { link: item.link, image: `/api/nda/${slug}/image`, expiresAt },
    { headers: { "cache-control": "no-store" } },
  );
}
