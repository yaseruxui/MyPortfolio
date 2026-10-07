import type { MetadataRoute } from "next";
import { CASE_STUDIES } from "@/content/projects";
import { SITE_URL, alternatesFor } from "@/lib/site-url";

/** /sitemap.xml — every page in both languages, cross-linked with hreflang. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/work", "/cv", ...CASE_STUDIES.map((p) => `/work/${p.slug}`)];
  const abs = (p: string) => `${SITE_URL}${p === "/" ? "" : p}`;

  return paths.flatMap((path) => {
    const { languages } = alternatesFor("ar", path);
    const alternates = {
      languages: { ar: abs(languages.ar), en: abs(languages.en) },
    };
    return [languages.ar, languages.en].map((p) => ({
      url: abs(p),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates,
    }));
  });
}
