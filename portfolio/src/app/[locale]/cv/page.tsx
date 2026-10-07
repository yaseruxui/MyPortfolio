import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/types/content";
import { CV } from "@/content/cv";
import { SITE } from "@/content/site";
import { img } from "@/utils/img";
import { alternatesFor } from "@/lib/site-url";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { SplitText } from "@/components/ui/SplitText";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { CvMotion } from "@/features/cv/CvMotion";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = CV[locale as Locale];
  return {
    // the CV page carries the full legal name; the rest of the site uses "Yaser"
    title: `${c.name} — ${locale === "ar" ? "السيرة الذاتية" : "CV"}`,
    description: c.tagline,
    alternates: alternatesFor(locale, "/cv"),
  };
}

export default async function CvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const c = CV[locale as Locale];
  const isRtl = locale === "ar";
  const back = isRtl ? "→" : "←";
  const maxH = Math.max(...c.courses.map((x) => x.h));

  return (
    <>
      <div className="read-progress" aria-hidden="true">
        <span />
      </div>

      <main id="cv">
        <section className="cv-hero">
          <TransitionLink href="/" className="cv-back link-roll">
            <span data-text={`${back} ${c.back}`}>
              {back} {c.back}
            </span>
          </TransitionLink>
          <div className="cv-hero__main">
            <div className="cv-hero__photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(SITE.portrait, 700)} alt={c.name} />
            </div>
            <div className="cv-hero__text">
              <span className="cv-kicker mono">{c.role}</span>
              <h1 className="cv-name">
                <SplitText className="js-split" text={c.name} />
              </h1>
              <p className="cv-tagline">{c.tagline}</p>
              <div className="cv-contact mono">
                <a href={`mailto:${SITE.email}`} className="cv-chip">
                  ✉ {SITE.email}
                </a>
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  className="cv-chip"
                  target="_blank"
                  rel="noopener"
                  dir="ltr"
                >
                  ✆ +{SITE.whatsapp}
                </a>
                <span className="cv-chip">⌖ {c.location}</span>
              </div>
              <a
                href={img(SITE.cv)}
                className="btn btn--solid magnetic cv-dl"
                download
              >
                <span>{c.download}</span> <i aria-hidden="true">↓</i>
              </a>
            </div>
          </div>
        </section>

        <div className="cv-grid">
          <section className="cv-sec cv-span2">
            <h2 className="cv-h">
              <span className="cv-h__n mono">01</span>
              {c.sections.experience}
            </h2>
            <div className="cv-timeline">
              {c.experience.map((e, i) => (
                <article className="cv-item" key={i}>
                  <span className="cv-item__dot" />
                  <span className="cv-item__date mono">{e.date}</span>
                  <h3>{e.role}</h3>
                  <span className="cv-item__org">
                    <span className="cv-item__logo" aria-hidden="true">
                      {e.logo === "icon:freelance" ? (
                        // no company behind freelance work: a neutral briefcase
                        <svg viewBox="0 0 24 24" className="cv-item__icon" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="7" width="18" height="13" rx="2.5" />
                          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
                        </svg>
                      ) : e.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img(e.logo, 160)} alt="" loading="lazy" />
                      ) : (
                        // monogram until a logo file is added in cv.json
                        <span>{[...e.org.trim()][0]}</span>
                      )}
                    </span>
                    {e.org}
                  </span>
                  <p>{e.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="cv-sec">
            <h2 className="cv-h">
              <span className="cv-h__n mono">02</span>
              {c.sections.skills}
            </h2>
            <ul className="cv-skills">
              {c.technical.map((s, i) => (
                <li className="cv-skill" key={i}>
                  {s}
                </li>
              ))}
            </ul>
            {(
              [
                [c.sections.tools, c.tools, "cv-tool"],
                [c.sections.ai, c.aiTools, "cv-tool cv-tool--ai"],
                [c.sections.personal, c.personal, "cv-tag"],
              ] as const
            ).map(([label, list, cls]) => (
              <div className="cv-chips" key={label}>
                <h3 className="cv-chips__label mono">{label}</h3>
                {list.map((p, i) => (
                  <span className={cls} key={i} dir="auto">
                    {cls !== "cv-tag" && <ToolIcon name={p} className="cv-tool__icon" />}
                    {p}
                  </span>
                ))}
              </div>
            ))}
          </section>

          <section className="cv-sec">
            <h2 className="cv-h">
              <span className="cv-h__n mono">03</span>
              {c.sections.education}
            </h2>
            {c.education.map((e, i) => (
              <article className="cv-edu" key={i}>
                <span className="cv-item__date mono">{e.date}</span>
                <h3>{e.title}</h3>
                <span className="cv-item__org">{e.org}</span>
                <p>{e.desc}</p>
              </article>
            ))}
          </section>

          <section className="cv-sec cv-span2">
            <h2 className="cv-h">
              <span className="cv-h__n mono">04</span>
              {c.sections.courses}
            </h2>
            <div className="cv-courses">
              {c.courses.map((x, i) => (
                <div className="cv-course" key={i}>
                  <div className="cv-course__top">
                    <span className="cv-course__n">{x.n}</span>
                    <span className="cv-course__h mono" dir="ltr">
                      {x.h}h
                    </span>
                  </div>
                  <div className="cv-course__track">
                    <span
                      style={
                        {
                          "--v": `${Math.round((x.h / maxH) * 100)}%`,
                        } as CSSProperties
                      }
                    />
                  </div>
                  <span className="cv-course__org mono">{x.org}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="cv-sec cv-span3">
            <h2 className="cv-h">
              <span className="cv-h__n mono">05</span>
              {c.sections.references}
            </h2>
            <div className="cv-refs">
              {c.references.map((r, i) => (
                <article className="cv-ref" key={i}>
                  <h3>{r.name}</h3>
                  <span className="cv-ref__role">{r.role}</span>
                </article>
              ))}
            </div>
            <p className="cv-refs__note mono">{c.refNote}</p>
          </section>
        </div>
      </main>

      <CvMotion />
    </>
  );
}
