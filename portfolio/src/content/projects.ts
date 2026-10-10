import type { Project, Locale } from "@/types/content";
import data from "./projects.json";

/** Order here = order on the site. */
export const PROJECTS = data as Project[];

/** Projects that have a full case study (the home "Selected work" story). */
export const CASE_STUDIES: Project[] = PROJECTS.filter((p) => p.study);

/** Every project that gets its own /work/<slug> page. NDA projects are left
    out: their card stays behind the password gate instead. */
export const PUBLIC_PROJECTS: Project[] = PROJECTS.filter((p) => !p.nda);

export function getProject(slug: string): Project | undefined {
  return PUBLIC_PROJECTS.find((p) => p.slug === slug);
}

export function getProjectIndex(slug: string): number {
  const i = PUBLIC_PROJECTS.findIndex((p) => p.slug === slug);
  return i < 0 ? 0 : i;
}

export function projectSummary(p: Project, locale: Locale): string {
  return p[locale]?.summary ?? p.study?.[locale].tagline ?? "";
}

export function projectCategory(
  p: Project,
  locale: Locale,
  fallback: string,
): string {
  return p[locale]?.category ?? fallback;
}
