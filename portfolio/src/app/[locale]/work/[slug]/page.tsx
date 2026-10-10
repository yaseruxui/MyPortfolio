import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LINK_KEYS, type Locale } from "@/types/content";
import { PUBLIC_PROJECTS, getProject, projectCategory, projectSummary } from "@/content/projects";
import { SITE } from "@/content/site";
import { img } from "@/utils/img";
import { SITE_URL, alternatesFor } from "@/lib/site-url";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { SplitText } from "@/components/ui/SplitText";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { CaseMotion } from "@/features/work/CaseMotion";

const pad = (n: number) => String(n).padStart(2, "0");

export function generateStaticParams() {
  return PUBLIC_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const desc = p.study?.[locale as Locale].tagline ?? projectSummary(p, locale as Locale);
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const title = `${p.title} — ${tMeta("name")}`;
  const cover = `${SITE_URL}${img(p.images.cover)}`;

  return {
    title,
    description: desc,
    alternates: alternatesFor(locale, `/work/${slug}`),
    openGraph: {
      type: "article",
      title,
      description: desc,
      images: [{ url: cover }],
    },
    twitter: { card: "summary_large_image", title, description: desc },
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
  if (!p) notFound();

  const loc = locale as Locale;
  const s = p.study?.[loc];
  const index = PUBLIC_PROJECTS.findIndex((x) => x.slug === slug);
  const total = PUBLIC_PROJECTS.length;
  const next = PUBLIC_PROJECTS[(index + 1) % total]!;
  const isRtl = locale === "ar";
  const back = isRtl ? "→" : "←";

  const tCase = await getTranslations({ locale, namespace: "case" });
  const tType = await getTranslations({ locale, namespace: "work.type" });
  const tCursor = await getTranslations({ locale, namespace: "cursor" });
  const tLink = await getTranslations({ locale, namespace: "links" });

  // lighter projects carry a one-line summary instead of a full study
  const lede = s?.tagline ?? projectSummary(p, loc);
  const category = projectCategory(p, loc, tType(p.type));

  // the meta bar carries the facts worth scanning plus the project's links;
  // role and team read better inside the overview than as bare labels
  const facts: Array<[string, string]> = (
    [["year", String(p.year)]] as Array<[string, string]>
  ).filter(([, v]) => v);
  // "Adobe XD · After Effects" → one chip per tool, each with its own mark
  const tools = (s?.tools ?? "")
    .split("·")
    .map((t) => t.trim())
    .filter(Boolean);
  const hasLinks = !!p.links && Object.keys(p.links).length > 0;

  const gallery = p.images.gallery ?? [];
  const linkLabels = Object.fromEntries(LINK_KEYS.map((k) => [k, tLink(k)]));
  const waText = tCase("ctaWa", { title: p.title });
  const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(waText)}`;

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
          <p className="c-hero__cat mono">{category}</p>
          <h1 className="c-hero__title">
            <span className="line">
              <SplitText className="js-split" dir="ltr" text={p.title} />
            </span>
          </h1>
          <p className="c-hero__tagline">{lede}</p>
          <dl className="c-meta">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{tCase(k)}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            {tools.length > 0 && (
              <div className="c-meta__tools">
                <dt className="mono">{tCase("tools")}</dt>
                <dd>
                  {tools.map((name) => (
                    <span className="c-tool" key={name}>
                      <ToolIcon name={name} />
                      <bdi>{name}</bdi>
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {hasLinks && (
              <div className="c-meta__links">
                <dt className="mono">{tCase("projectLinks")}</dt>
                <dd>
                  <ProjectLinks links={p.links} labels={linkLabels} />
                </dd>
              </div>
            )}
          </dl>
        </section>

        <figure className="c-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(p.images.cover)} alt={p.title} />
        </figure>

        {/* content scrolls on one side, the links + CTA stay in view on the other */}
        <div className="c-body">
          <div className="c-body__main">
            <section className="c-sec c-sec--flush">
              <span className="c-label mono">(01) — {tCase("overview")}</span>
              <p
                className="c-overview js-reveal-words"
                dangerouslySetInnerHTML={{ __html: s?.overview ?? lede }}
              />
            </section>

            {gallery.length > 0 && (
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
            )}
          </div>

          <aside className="c-aside">
            <div className="c-aside__inner">
              <div className="c-cta">
                <p className="c-cta__q">{tCase("ctaTitle")}</p>
                <p className="c-cta__txt">{tCase("ctaText")}</p>
                <a
                  href={waHref}
                  className="btn btn--solid"
                  target="_blank"
                  rel="noopener"
                  data-cursor-label={tCursor("hi")}
                >
                  <span>{tCase("ctaBtn")}</span> <i aria-hidden="true">{isRtl ? "←" : "→"}</i>
                </a>
              </div>
            </div>
          </aside>
        </div>

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
