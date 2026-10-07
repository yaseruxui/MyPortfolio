import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectGrid } from "@/features/work/ProjectGrid";
import { ArchiveMotion } from "@/features/work/ArchiveMotion";
import { SplitText } from "@/components/ui/SplitText";
import { alternatesFor } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const tWork = await getTranslations({ locale, namespace: "work" });
  const title = `${tWork("allT1")} ${tWork("allT2")} — ${tMeta("name")}`;
  return {
    title,
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

  return (
    <>
      <main className="work">
        <ProjectGrid
          header={
            <div>
              <span className="label mono">{t("allLabel")}</span>
              <h1 className="section-title">
                <SplitText className="js-split" text={t("allT1")} />{" "}
                <SplitText
                  as="em"
                  className="serif neon js-split"
                  text={t("allT2")}
                />
              </h1>
            </div>
          }
        />
      </main>
      <ArchiveMotion />
    </>
  );
}
