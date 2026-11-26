import { useLocale, useTranslations } from "next-intl";
import { TESTIMONIALS } from "@/content/testimonials";
import type { Locale } from "@/types/content";
import { Words } from "@/components/ui/Words";
import { SectionHead } from "@/components/ui/SectionHead";

/** Hidden entirely until real quotes exist (placeholders never ship to production). */
export function Testimonials() {
  const locale = useLocale() as Locale;
  const t = useTranslations("testimonials");
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="tms sec">
      <SectionHead n="04" label={t("label")} />
      <h2 className="tms__title display" data-reveal="lines">
        <Words text={t("t1")} /> <Words as="em" text={t("t2")} />
      </h2>
      <div className="tms__grid">
        {TESTIMONIALS.map((q, i) => (
          <figure className="quote" key={i} data-reveal="fade" data-delay={String(i * 0.08)}>
            <span className="quote__mark" aria-hidden="true">
              ”
            </span>
            <blockquote>{q.quote[locale]}</blockquote>
            <figcaption>
              <b>{q.name}</b>
              <span>
                {q.role[locale]} · <bdi>{q.company}</bdi>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
