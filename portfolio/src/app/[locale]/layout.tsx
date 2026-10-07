import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/content";
import { MotionProvider } from "@/components/fx/MotionProvider";
import { Overlays } from "@/components/fx/Overlays";
import { Cursor } from "@/components/fx/Cursor";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SITE_URL } from "@/lib/site-url";
import "@/styles/globals.css";

export const viewport: Viewport = {
  themeColor: "#07070a",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  // designed share card per language (scripts/render-og.mjs)
  const ogImage = { url: `/og/og-${locale}.jpg`, width: 1200, height: 630, alt: t("title") };

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("desc"),
    // canonical/hreflang are set per page (see alternatesFor)
    openGraph: {
      type: "website",
      title: t("title"),
      description: t("desc"),
      images: [ogImage],
      locale: locale === "ar" ? "ar_EG" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("desc"),
      images: [ogImage],
    },
    icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* IBM Plex Sans Arabic — used only for the process-section body text */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="page-home">
        <NextIntlClientProvider>
          <MotionProvider>
            <Overlays />
            <Cursor />
            <SiteHeader />
            {children}
            <SiteFooter />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
