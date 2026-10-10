import { useLocale, useTranslations } from "next-intl";
import { CASE_STUDIES, projectCategory } from "@/content/projects";
import type { Locale } from "@/types/content";
import { img } from "@/utils/img";
import { TransitionLink } from "@/components/ui/TransitionLink";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Home "Selected work": the case studies told one by one. On desktop
 * HomeMotion pins the block (.is-pinned), stacks the projects on one stage and
 * scrubs between them; the side index and its bar track progress.
 * Below 900px (or with reduced motion) everything stacks: cover, then details.
 */
export function WorkStory() {
  const t = useTranslations("work");
  const tCase = useTranslations("case");
  const tCursor = useTranslations("cursor");
  const locale = useLocale() as Locale;
  const arrow = locale === "ar" ? "←" : "→";
  const total = pad(CASE_STUDIES.length);

  return (
    <div className="wstory">
      <div className="wstory__index" aria-hidden="true">
        <ol>
          {CASE_STUDIES.map((p, i) => (
            <li key={p.slug} className={`wstory__idx${i === 0 ? " is-active" : ""}`}>
              <span className="mono">{pad(i + 1)}</span>
              <bdi>{p.title.split(" — ")[0]}</bdi>
            </li>
          ))}
        </ol>
        <span className="wstory__bar">
          <i />
        </span>
      </div>

      <div className="wstory__list">
        {CASE_STUDIES.map((p, i) => {
          const s = p.study![locale];
          const href = `/work/${p.slug}`;
          return (
            <article key={p.slug} className={`wstory__item${i === 0 ? " is-current" : ""}`}>
              <div className="wstory__info">
                <span className="wstory__num mono">
                  <bdi>
                    {pad(i + 1)} / {total}
                  </bdi>
                  <span aria-hidden="true">—</span>
                  {projectCategory(p, locale, t(`type.${p.type}`))}
                </span>
                <h3 className={`wstory__title${p.title.length > 12 ? " is-long" : ""}`}>
                  <bdi>{p.title}</bdi>
                </h3>
                <p className="wstory__tag">{s.tagline}</p>
                <dl className="wstory__facts">
                  <div>
                    <dt>{tCase("role")}</dt>
                    <dd>{s.role}</dd>
                  </div>
                  <div>
                    <dt>{tCase("tools")}</dt>
                    <dd dir="ltr">{s.tools}</dd>
                  </div>
                  <div>
                    <dt>{tCase("team")}</dt>
                    <dd>{s.team}</dd>
                  </div>
                </dl>
                <div className="wstory__ctas">
                  <TransitionLink href={href} className="btn btn--solid magnetic">
                    <span>{t("caseStudy")}</span> <i aria-hidden="true">{arrow}</i>
                  </TransitionLink>
                  {p.links?.behance && (
                    <a href={p.links.behance} className="btn magnetic" target="_blank" rel="noopener">
                      <span dir="ltr">Behance ↗</span>
                    </a>
                  )}
                </div>
              </div>

              <TransitionLink
                href={href}
                className="wstory__media"
                data-cursor-label={tCursor("view")}
                tabIndex={-1}
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(p.images.thumb ?? p.images.cover)} alt="" loading={i === 0 ? "eager" : "lazy"} />
              </TransitionLink>
            </article>
          );
        })}
      </div>
    </div>
  );
}
