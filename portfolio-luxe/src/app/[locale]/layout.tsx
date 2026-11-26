import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LuxeProvider } from "@/components/motion/LuxeProvider";
import { Reveals } from "@/components/motion/Reveals";
import { Cursor } from "@/components/layout/Cursor";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL } from "@/lib/site-url";
import "@/styles/luxe.css";

export const viewport: Viewport = {
  themeColor: "#0b0a08",
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
  const ogImage = { url: `/og/og-${locale}.jpg`, width: 1200, height: 630, alt: t("title") };

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("desc"),
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

/* Marks the document as script-capable before first paint, so reveal targets
   start hidden only when something will actually reveal them. */
const BOOT = `(function(d){d.classList.add('js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('reveal-off')})(document.documentElement)`;

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

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <link rel="preload" href="/fonts/thmanyahserifdisplay-Regular.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/thmanyahsans-Regular.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <NextIntlClientProvider>
          <LuxeProvider>
            <div className="grain" aria-hidden="true" />
            <Cursor />
            <Header />
            {children}
            <Footer />
            <Reveals />
          </LuxeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
