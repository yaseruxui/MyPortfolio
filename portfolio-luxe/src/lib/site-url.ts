/** Canonical production origin (used for metadataBase, OG images, JSON-LD). */
export const SITE_URL = "https://yaser.design";

/**
 * Canonical + hreflang for one page. Arabic (default locale) has no prefix,
 * English lives under /en. `path` is the locale-less path, e.g. "/cv".
 * Set per page: a layout-level canonical would mark every page as a
 * duplicate of the home page.
 */
export function alternatesFor(locale: string, path = "") {
  const p = path === "/" ? "" : path;
  return {
    canonical: locale === "ar" ? p || "/" : `/en${p}`,
    languages: { ar: p || "/", en: `/en${p}` },
  };
}
