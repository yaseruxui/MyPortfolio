import { routing } from "./routing";

/**
 * Build a locale-aware href for localePrefix "as-needed":
 * the default locale (ar) has no prefix, others get "/<locale>".
 * Preserves a trailing #hash.
 * (We localize manually and drive navigation with next/navigation's raw
 * router because next-intl's createNavigation router.push was a no-op here.)
 */
export function localizeHref(href: string, locale: string): string {
  const [path, hash] = href.split("#");
  const h = hash ? `#${hash}` : "";
  if (locale === routing.defaultLocale) return `${path}${h}`;
  if (path === "/") return `/${locale}${h}`;
  return `/${locale}${path}${h}`;
}

/** Strip any locale prefix from a full pathname, returning the bare path. */
export function stripLocale(pathname: string): string {
  for (const l of routing.locales) {
    if (l === routing.defaultLocale) continue;
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname || "/";
}
