import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/content";
import { TESTIMONIALS } from "@/content/testimonials";
import { SplitText } from "@/components/ui/SplitText";

/**
 * "What they said": a masonry wall of quote cards (CSS columns, so each card
 * keeps its natural height). The second card is the highlighted one — with
 * three quotes it lands in the middle column.
 */
export function Testimonials() {
  const t = useTranslations("testimonials");
  const locale = useLocale() as Locale;
  if (!TESTIMONIALS.length) return null;

  return (
    <section className="tms" id="testimonials">
      <div className="tm-head">
        <span className="label mono">{t("label")}</span>
        <h2 className="section-title">
          <SplitText className="js-split" text={t("t1")} />{" "}
          <SplitText as="em" className="serif neon js-split" text={t("t2")} />
        </h2>
        <p className="tm-desc">{t("desc")}</p>
      </div>

      <div className="tm-grid">
        {TESTIMONIALS.map((tm, i) => {
          const placeholder = tm.photo.includes("placeholder");
          return (
            <figure key={i} className={`tm-card${i === 1 ? " tm-card--hi" : ""}`}>
              <svg className="tm-card__mark" viewBox="0 0 32 24" aria-hidden="true">
                <path d="M0 24V14.4C0 6.1 4.4 1.3 12.2 0l1.4 3.4C9.2 4.6 7 7.4 6.8 11.2H12V24H0zm18 0V14.4C18 6.1 22.4 1.3 30.2 0l1.4 3.4c-4.4 1.2-6.6 4-6.8 7.8H30V24H18z" />
              </svg>
              <blockquote className="tm-card__quote">{tm.quote[locale]}</blockquote>
              {tm.audio && <audio className="tm__audio" controls preload="none" src={tm.audio} />}
              <figcaption className="tm-card__person">
                <span className={`tm-card__avatar${placeholder ? " is-empty" : ""}`}>
                  {placeholder ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="9" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tm.photo} alt="" loading="lazy" />
                  )}
                </span>
                <span className="tm-card__meta">
                  <bdi className="tm-card__name">{tm.name}</bdi>
                  <span className="tm-card__role">
                    {tm.role[locale]} · <bdi>{tm.company}</bdi>
                  </span>
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
