import { useLocale, useTranslations } from "next-intl";
import { CASE_STUDIES, PROJECTS } from "@/content/projects";
import type { Locale } from "@/types/content";
import { img } from "@/utils/img";
import { Words } from "@/components/ui/Words";
import { TLink } from "@/components/ui/TLink";
import { SectionHead } from "@/components/ui/SectionHead";
import { WorkIndex } from "@/features/work/WorkIndex";

const pad = (n: number) => String(n).padStart(2, "0");

/** Home "Selected work": the full case studies as large editorial plates,
    then an index of everything. */
export function Selected() {
  const locale = useLocale() as Locale;
  const t = useTranslations("work");
  const tLuxe = useTranslations("luxe");
  const tCursor = useTranslations("cursor");

  return (
    <section className="sel sec" id="work">
      <SectionHead n="02" label={t("label")} aside={tLuxe("count", { n: pad(PROJECTS.length) })} />

      <h2 className="sel__title display" data-reveal="lines">
        <Words text={t("t1")} /> <Words as="em" text={t("t2")} />
      </h2>

      <div className="sel__list">
        {CASE_STUDIES.map((p, i) => {
          const s = p.study![locale];
          return (
            <TLink key={p.slug} href={`/work/${p.slug}`} className="plate" data-cursor={tCursor("view")}>
              <div className="plate__media" data-reveal="clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(p.images.thumb ?? p.images.cover)} alt={p.title} loading="lazy" />
              </div>
              <div className="plate__info">
                <span className="plate__n" dir="ltr">
                  {pad(i + 1)}
                </span>
                <h3 className="plate__title" dir="ltr" data-reveal="lines">
                  <Words text={p.title} />
                </h3>
                <p className="plate__tag" data-reveal="fade">
                  {s.tagline}
                </p>
                <dl className="plate__meta" data-reveal="fade" data-delay="0.1">
                  <div>
                    <dt>{t("caseStudy")}</dt>
                    <dd>{t(`type.${p.type}`)}</dd>
                  </div>
                  <div>
                    <dt>{s.role}</dt>
                    <dd dir="ltr">{p.year}</dd>
                  </div>
                </dl>
                <span className="plate__more">
                  {tLuxe("explore")}
                  <i className="btn__arrow" aria-hidden="true" />
                </span>
              </div>
            </TLink>
          );
        })}
      </div>

      <WorkIndex />

      <div className="sel__cta" data-reveal="fade">
        <TLink href="/work" className="btn btn--line">
          <span>{t("viewAll")}</span>
          <i className="btn__arrow" aria-hidden="true" />
        </TLink>
      </div>
    </section>
  );
}
