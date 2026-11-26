import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** /robots.txt — everything is public; points crawlers at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
