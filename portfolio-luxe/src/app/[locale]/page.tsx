import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE } from "@/content/site";
import { CV } from "@/content/cv";
import { TESTIMONIALS } from "@/content/testimonials";
import type { Locale } from "@/types/content";
import { img } from "@/utils/img";
import { SITE_URL, alternatesFor } from "@/lib/site-url";
import { Loader } from "@/components/layout/Loader";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { About } from "@/components/sections/About";
import { Selected } from "@/components/sections/Selected";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor(locale) };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: t("name"),
    alternateName: CV[locale as Locale].name,
    jobTitle: "UX/UI Designer",
    description: t("desc"),
    url: SITE_URL,
    image: `${SITE_URL}${img(SITE.portrait)}`,
    email: SITE.email,
    sameAs: Object.values(SITE.social).filter((u) => u && u !== "#"),
  };

  // section numbers close up when the testimonials section is hidden
  const hasQuotes = TESTIMONIALS.length > 0;

  return (
    <>
      <Loader />
      <main id="top">
        <Hero />
        <Marquee />
        <About />
        <Selected />
        <Process />
        <Testimonials />
        <Faq n={hasQuotes ? "05" : "04"} />
        <Contact n={hasQuotes ? "06" : "05"} />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
    </>
  );
}
