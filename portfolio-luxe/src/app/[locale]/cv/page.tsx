import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/types/content";
import { CV } from "@/content/cv";
import { SITE } from "@/content/site";
import { img } from "@/utils/img";
import { alternatesFor } from "@/lib/site-url";
import { TLink } from "@/components/ui/TLink";
import { Words } from "@/components/ui/Words";
import { ToolIcon } from "@/components/ui/ToolIcon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = CV[locale as Locale];
  return {
    title: `${c.name} — ${locale === "ar" ? "السيرة الذاتية" : "CV"}`,
    description: c.tagline,
    alternates: alternatesFor(locale, "/cv"),
  };
}

function Head({ n, title }: { n: string; title: string }) {
  return (
    <div className="cvs__head" data-reveal="fade">
      <span className="shead__n" dir="ltr">
        ({n})
      </span>
      <h2>{title}</h2>
    </div>
  );
}

export default async function CvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CV[locale as Locale];
  const maxH = Math.max(...c.courses.map((x) => x.h));

  return (
    <main className="page">
      <div className="page-head__row" data-reveal="fade" style={{ marginBottom: "clamp(40px, 6vw, 90px)" }}>
        <TLink href="/" className="backlink">
          <i className="btn__arrow" aria-hidden="true" />
          {c.back}
        </TLink>
        <span className="shead__rule" aria-hidden="true" />
        <span className="eyebrow">{c.location}</span>
      </div>

      <section className="cvh">
        <div className="cvh__text">
          <span className="cvh__role" data-reveal="fade">
            {c.role}
          </span>
          <h1 className="cvh__name" data-reveal="lines">
            <Words text={c.name} />
          </h1>
          <p className="cvh__tag" data-reveal="fade" data-delay="0.2">
            {c.tagline}
          </p>
          <div className="cvh__chips" data-reveal="fade" data-delay="0.3">
            <a href={`mailto:${SITE.email}`} className="chip" dir="ltr">
              {SITE.email}
            </a>
            <a href={`https://wa.me/${SITE.whatsapp}`} className="chip" target="_blank" rel="noopener" dir="ltr">
              +{SITE.whatsapp}
            </a>
          </div>
          <div data-reveal="fade" data-delay="0.4">
            <a href={img(SITE.cv)} className="btn btn--gold" download>
              <span>{c.download}</span>
              <i aria-hidden="true">↓</i>
            </a>
          </div>
        </div>
        <figure className="cvh__photo">
          <div className="hero__arch" data-reveal="clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(SITE.portrait, 800)} alt={c.name} />
          </div>
          <span className="hero__arch-line" aria-hidden="true" />
        </figure>
      </section>

      <section className="cvs">
        <Head n="01" title={c.sections.experience} />
        <div className="cvs__body">
          {c.experience.map((e, i) => (
            <article className="xp" key={i} data-reveal="fade">
              <span className="xp__date">{e.date}</span>
              <div>
                <h3 className="xp__role">{e.role}</h3>
                <span className="xp__org">
                  <span className="xp__logo" aria-hidden="true">
                    {e.logo === "icon:freelance" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="7" width="18" height="13" rx="2.5" />
                        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
                      </svg>
                    ) : e.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img(e.logo, 160)} alt="" loading="lazy" />
                    ) : (
                      <span>{[...e.org.trim()][0]}</span>
                    )}
                  </span>
                  {e.org}
                </span>
                <p className="xp__desc">{e.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cvs">
        <Head n="02" title={c.sections.skills} />
        <div className="cvs__body skills">
          {(
            [
              [c.sections.skills, c.technical, false],
              [c.sections.tools, c.tools, true],
              [c.sections.ai, c.aiTools, true],
              [c.sections.personal, c.personal, false],
            ] as const
          ).map(([label, list, icons], i) => (
            <div key={i} data-reveal="fade">
              <span className="eyebrow">{label}</span>
              <div className="chips">
                {list.map((x) => (
                  <span className="chip tool" key={x} dir="auto">
                    {icons && <ToolIcon name={x} />}
                    {x}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cvs">
        <Head n="03" title={c.sections.education} />
        <div className="cvs__body">
          {c.education.map((e, i) => (
            <article className="edu" key={i} data-reveal="fade">
              <span className="xp__date">{e.date}</span>
              <div>
                <h3 className="xp__role">{e.title}</h3>
                <span className="xp__org">{e.org}</span>
                <p className="xp__desc">{e.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cvs">
        <Head n="04" title={c.sections.courses} />
        <div className="cvs__body">
          {c.courses.map((x, i) => (
            <div className="course" key={i} data-reveal="fade">
              <span className="course__n">{x.n}</span>
              <span className="course__h" dir="ltr">
                {x.h}h
              </span>
              <span className="course__bar">
                <span style={{ "--v": `${Math.round((x.h / maxH) * 100)}%` } as CSSProperties} />
              </span>
              <span className="course__org">{x.org}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cvs">
        <Head n="05" title={c.sections.references} />
        <div className="cvs__body">
          <div className="refs">
            {c.references.map((r, i) => (
              <article className="ref" key={i} data-reveal="fade">
                <h3>{r.name}</h3>
                <span>{r.role}</span>
              </article>
            ))}
          </div>
          <p className="refs__note">{c.refNote}</p>
        </div>
      </section>
      <div className="cv-end" />
    </main>
  );
}
