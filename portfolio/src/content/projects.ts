import type { Project, Locale } from "@/types/content";
import data from "./projects.json";

/** Order here = order on the site. */
export const PROJECTS = data as Project[];

/** Projects that have a full case study (used for /work/[slug]). */
export const CASE_STUDIES: Project[] = PROJECTS.filter((p) => p.study);

export function getProject(slug: string): Project | undefined {
  return CASE_STUDIES.find((p) => p.slug === slug);
}

export function getProjectIndex(slug: string): number {
  const i = CASE_STUDIES.findIndex((p) => p.slug === slug);
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
