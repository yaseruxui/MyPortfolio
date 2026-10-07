/**
 * Resolve an image source.
 * - A local path (contains "/" or ".") is served from /public as-is ("/images/..").
 * - Anything else is treated as an Unsplash photo ID and expanded to a full URL.
 * Mirrors the original IMG() helper from data.js.
 */
export function img(src: string, w = 1600): string {
  if (/[/.]/.test(src)) {
    return src.startsWith("/") || src.startsWith("http") ? src : `/${src}`;
  }
  return `https://images.unsplash.com/photo-${src}?w=${w}&q=80&auto=format&fit=crop`;
}

/** True when the source is a remote (Unsplash) URL after resolution. */
export function isRemote(src: string): boolean {
  return img(src).startsWith("http");
}
