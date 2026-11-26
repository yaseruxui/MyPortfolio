import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PROJECTS } from "@/content/projects";
import { SITE } from "@/content/site";
import { alternatesFor } from "@/lib/site-url";
import { Words } from "@/components/ui/Words";
import { Archive } from "@/features/work/Archive";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const tWork = await getTranslations({ locale, namespace: "work" });
  return {
    title: `${tWork("allT1")} ${tWork("allT2")} — ${tMeta("name")}`,
    description: tMeta("desc"),
    alternates: alternatesFor(locale, "/work"),
  };
}

export default async function WorkArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "work" });
  const tLuxe = await getTranslations({ locale, namespace: "luxe" });
  const tContact = await getTranslations({ locale, namespace: "contact" });

  return (
    <main className="page">
      <header className="page-head">
        <div className="page-head__row" data-reveal="fade">
          <span className="eyebrow">{t("allLabel")}</span>
          <span className="shead__rule" aria-hidden="true" />
          <span className="eyebrow">{tLuxe("count", { n: String(PROJECTS.length).padStart(2, "0") })}</span>
        </div>
        <h1 className="display" data-reveal="lines" style={{ fontSize: "clamp(72px, 13vw, 240px)" }}>
          <Words text={t("allT1")} /> <Words as="em" text={t("allT2")} />
        </h1>
      </header>

      <Archive />

      <div className="page-note" data-reveal="fade">
        <p dangerouslySetInnerHTML={{ __html: t("more") }} />
        <a href={`https://wa.me/${SITE.whatsapp}`} className="btn btn--gold" target="_blank" rel="noopener">
          <span>{tContact("btn")}</span>
          <i className="btn__arrow" aria-hidden="true" />
        </a>
      </div>
      <div className="cv-end" />
    </main>
  );
}
