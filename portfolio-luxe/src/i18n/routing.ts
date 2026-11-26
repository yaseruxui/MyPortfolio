import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // Arabic (default) is served from "/", English from "/en".
  localePrefix: "as-needed",
  // The original site is always Arabic-first; don't auto-switch to the
  // browser language. The EN toggle is the only way to reach English.
  localeDetection: false,
});
