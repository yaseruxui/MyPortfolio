import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/types/content";
import { CASE_STUDIES, getProject } from "@/content/projects";
import { img } from "@/utils/img";
import { SITE_URL, alternatesFor } from "@/lib/site-url";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { SplitText } from "@/components/ui/SplitText";
import { CaseMotion } from "@/features/work/CaseMotion";

const pad = (n: number) => String(n).padStart(2, "0");

export function generateStaticParams() {
  return CASE_STUDIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProject(slug);
  if (!p || !p.study) return {};
  const s = p.study[locale as Locale];
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const title = `${p.title} — ${tMeta("name")}`;
  const cover = `${SITE_URL}${img(p.images.cover)}`;

  return {
    title,
    description: s.tagline,
    alternates: alternatesFor(locale, `/work/${slug}`),
    openGraph: {
      type: "article",
      title,
      description: s.tagline,
      images: [{ url: cover }],
    },
    twitter: { card: "summary_large_image", title, description: s.tagline },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const p = getProject(slug);
  if (!p || !p.study) notFound();

  const s = p.study[locale as Locale];
  const index = CASE_STUDIES.findIndex((x) => x.slug === slug);
  const total = CASE_STUDIES.length;
  const next = CASE_STUDIES[(index + 1) % total]!;
  const isRtl = locale === "ar";
  const back = isRtl ? "→" : "←";

  const tCase = await getTranslations({ locale, namespace: "case" });
  const tType = await getTranslations({ locale, namespace: "work.type" });
  const tCursor = await getTranslations({ locale, namespace: "cursor" });

  const facts: Array<[string, string]> = (
    [
      ["role", s.role],
      ["year", String(p.year)],
      ["tools", s.tools],
      ["team", s.team],
    ] as Array<[string, string]>
  ).filter(([, v]) => v);

  const gallery = p.images.gallery ?? [];

  return (
    <>
      <div className="read-progress" aria-hidden="true">
        <span />
      </div>

      <main id="case">
        <section className="c-hero">
          <div className="c-hero__top mono">
            <TransitionLink href="/work" className="link-roll">
              <span data-text={`${back} ${tCase("back")}`}>
                {back} {tCase("back")}
              </span>
            </TransitionLink>
            <span dir="ltr">
              {pad(index + 1)} / {pad(total)}
            </span>
          </div>
          <p className="c-hero__cat mono">{tType(p.type)}</p>
          <h1 className="c-hero__title">
            <span className="line">
              <SplitText className="js-split" dir="ltr" text={p.title} />
            </span>
          </h1>
          <p className="c-hero__tagline">{s.tagline}</p>
          <dl className="c-meta">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{tCase(k)}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <figure className="c-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(p.images.cover)} alt={p.title} />
        </figure>

        <section className="c-sec">
          <span className="c-label mono">(01) — {tCase("overview")}</span>
          <p
            className="c-overview js-reveal-words"
            dangerouslySetInnerHTML={{ __html: s.overview }}
          />
        </section>

        <section className="c-gallery">
          <span className="c-label mono c-gallery__label">
            (02) — {tCase("gallery")}
          </span>
          {gallery.map((src, i) => (
            <figure className="c-shot" key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(src)} alt={`${p.title} — ${pad(i + 1)}`} loading="lazy" />
            </figure>
          ))}
        </section>

        <a
          href={p.link}
          className="c-behance"
          target="_blank"
          rel="noopener"
          data-cursor-label={tCursor("view")}
        >
          <span className="mono">Behance ↗</span>
          <span className="c-behance__txt">{tCase("viewProject")}</span>
        </a>

        {(p.stores?.appStore || p.stores?.googlePlay) && (
          <div className="c-stores">
            {(["appStore", "googlePlay"] as const).map((k) =>
              p.stores?.[k] ? (
                <a
                  key={k}
                  href={p.stores[k]}
                  className="c-store mono"
                  target="_blank"
                  rel="noopener"
                  dir="ltr"
                >
                  {tCase(k)}
                </a>
              ) : null,
            )}
          </div>
        )}

        <TransitionLink
          href={`/work/${next.slug}`}
          className="c-next"
          data-cursor-label={tCursor("next")}
        >
          <span className="c-next__label mono">
            {tCase("next")} · {pad(((index + 1) % total) + 1)}
          </span>
          <span className="c-next__title">
            <span className="line">
              <SplitText className="js-split" dir="ltr" text={next.title} />
            </span>
          </span>
          <span className="c-next__cat mono">{tType(next.type)}</span>
          <span className="c-next__img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(next.images.thumb ?? next.images.cover)} alt={next.title} />
          </span>
        </TransitionLink>
      </main>

      <CaseMotion />
    </>
  );
}
