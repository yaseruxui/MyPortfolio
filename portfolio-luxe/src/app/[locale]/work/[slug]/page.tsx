import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LINK_KEYS, type Locale } from "@/types/content";
import { PUBLIC_PROJECTS, getProject, projectCategory, projectSummary } from "@/content/projects";
import { SITE } from "@/content/site";
import { img } from "@/utils/img";
import { SITE_URL, alternatesFor } from "@/lib/site-url";
import { TLink } from "@/components/ui/TLink";
import { Words, ReadWords } from "@/components/ui/Words";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { ToolIcon } from "@/components/ui/ToolIcon";

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
  const cover = `${SITE_URL}${img(p.images.thumb ?? p.images.cover)}`;
  return {
    title,
    description: desc,
    alternates: alternatesFor(locale, `/work/${slug}`),
    openGraph: { type: "article", title, description: desc, images: [{ url: cover }] },
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

  const tCase = await getTranslations({ locale, namespace: "case" });
  const tType = await getTranslations({ locale, namespace: "work.type" });
  const tCursor = await getTranslations({ locale, namespace: "cursor" });
  const tLink = await getTranslations({ locale, namespace: "links" });

  const lede = s?.tagline ?? projectSummary(p, loc);
  const category = projectCategory(p, loc, tType(p.type));
  const tools = (s?.tools ?? "")
    .split("·")
    .map((x) => x.trim())
    .filter(Boolean);
  const hasLinks = !!p.links && Object.keys(p.links).length > 0;
  const gallery = p.images.gallery ?? [];
  const linkLabels = Object.fromEntries(LINK_KEYS.map((k) => [k, tLink(k)]));
  const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(tCase("ctaWa", { title: p.title }))}`;
  // overview copy may carry inline markup; the scrubbed reading effect wants plain words
  const overview = (s?.overview ?? lede).replace(/<[^>]+>/g, " ");

  return (
    <main>
      <section className="case-hero">
        <div className="case-hero__top" data-reveal="fade">
          <TLink href="/work" className="backlink">
            <i className="btn__arrow" aria-hidden="true" />
            {tCase("back")}
          </TLink>
          <span className="case-hero__idx" dir="ltr">
            {pad(index + 1)} / {pad(total)}
          </span>
        </div>
        <span className="eyebrow" data-reveal="fade">
          {category}
        </span>
        <h1 className="case-hero__title" dir="ltr" data-reveal="lines">
          <Words text={p.title} />
        </h1>
        <p className="case-hero__lede" data-reveal="fade" data-delay="0.2">
          {lede}
        </p>

        <dl className="facts" data-reveal="fade" data-delay="0.3">
          <div>
            <dt>{tCase("year")}</dt>
            <dd dir="ltr">{p.year}</dd>
          </div>
          <div>
            <dt>{tCase("role")}</dt>
            <dd>{s?.role ?? tType(p.type)}</dd>
          </div>
          {tools.length > 0 ? (
            <div>
              <dt>{tCase("tools")}</dt>
              <dd>
                {tools.map((name) => (
                  <span className="tool" key={name}>
                    <ToolIcon name={name} />
                    <bdi>{name}</bdi>
                  </span>
                ))}
              </dd>
            </div>
          ) : (
            <div>
              <dt>{tCase("team")}</dt>
              <dd>—</dd>
            </div>
          )}
          <div>
            <dt>{tCase("projectLinks")}</dt>
            <dd>{hasLinks ? <ProjectLinks links={p.links} labels={linkLabels} /> : "—"}</dd>
          </div>
        </dl>
      </section>

      <figure className="case-cover" data-reveal="clip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img(p.images.thumb ?? p.images.cover)} alt={p.title} data-parallax="0.06" />
      </figure>

      <section className="case-sec">
        <div className="case-sec__label">
          <span className="shead__n" dir="ltr">
            (01)
          </span>
          <span className="eyebrow">{tCase("overview")}</span>
        </div>
        <div className="case-sec__body">
          <p className="case-overview" data-reveal="read">
            <ReadWords text={overview} />
          </p>
          {s && (
            <p className="case-role" data-reveal="fade">
              <span>
                {tCase("role")}
                <b>{s.role}</b>
              </span>
              <span>
                {tCase("team")}
                <b>{s.team}</b>
              </span>
            </p>
          )}
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="case-gallery" aria-label={tCase("gallery")}>
          {gallery.map((src, i) => (
            <figure className="shot" key={src}>
              <div className="shot__frame" data-reveal="clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(src)} alt={`${p.title} — ${pad(i + 1)}`} loading="lazy" />
              </div>
              <figcaption>
                <span>{tCase("gallery")}</span>
                <span dir="ltr">
                  {p.title} — {pad(i + 1)}
                </span>
              </figcaption>
            </figure>
          ))}
        </section>
      )}

      <section className="case-cta" data-reveal="fade">
        <div>
          <p className="case-cta__q">{tCase("ctaTitle")}</p>
          <p className="case-cta__t">{tCase("ctaText")}</p>
        </div>
        <a href={waHref} className="btn btn--gold" target="_blank" rel="noopener" data-cursor={tCursor("hi")}>
          <span>{tCase("ctaBtn")}</span>
          <i className="btn__arrow" aria-hidden="true" />
        </a>
      </section>

      <TLink href={`/work/${next.slug}`} className="case-next" data-cursor={tCursor("next")}>
        <span className="case-next__bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(next.images.thumb ?? next.images.cover)} alt="" loading="lazy" />
        </span>
        <span className="case-next__label">
          <span className="eyebrow">{tCase("next")}</span>
          <span className="eyebrow" dir="ltr">
            {pad(((index + 1) % total) + 1)} / {pad(total)}
          </span>
        </span>
        <span className="case-next__title" dir="ltr">
          {next.title}
        </span>
        <span className="eyebrow">{tType(next.type)}</span>
      </TLink>
    </main>
  );
}
