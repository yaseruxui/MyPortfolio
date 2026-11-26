import { useTranslations } from "next-intl";
import { SITE } from "@/content/site";
import { img } from "@/utils/img";
import { Words, clean } from "@/components/ui/Words";
import { TLink } from "@/components/ui/TLink";

export function Hero() {
  const t = useTranslations("hero");
  const tMeta = useTranslations("meta");
  const tLuxe = useTranslations("luxe");
  const tFooter = useTranslations("footer");
  const tNav = useTranslations("nav");
  const greet = clean(t("l1"));
  const ring = clean(t("scroll"));

  return (
    <section className="hero">
      <div className="hero__top" data-reveal="fade" data-delay="0.5">
        <span className="eyebrow">{tLuxe("role")}</span>
        <span className="hero__top-rule" aria-hidden="true" />
        <span className="eyebrow">{tFooter("city")}</span>
        <span className="hero__top-rule" aria-hidden="true" />
        <span className="eyebrow" dir="ltr">
          2018 — 2026
        </span>
      </div>

      <h1 className="hero__name" data-reveal="lines">
        <span className="sr-only">{clean(t("l2"))} — </span>
        <Words text={tMeta("name")} aria-hidden="true" />
      </h1>

      <div className="hero__grid">
        <div className="hero__intro">
          <p className="hero__greet" data-reveal="lines" data-delay="0.35">
            <Words text={`${greet} —`} />
          </p>
          <p
            className="hero__lede"
            data-reveal="fade"
            data-delay="0.55"
            dangerouslySetInnerHTML={{ __html: t("intro") }}
          />
          <div className="hero__cta" data-reveal="fade" data-delay="0.7">
            <TLink href="/work" className="btn btn--gold" data-cursor={t("ctaWork")}>
              <span>{t("ctaWork")}</span>
              <i aria-hidden="true" className="btn__arrow" />
            </TLink>
            <span className="hero__status">
              <i aria-hidden="true" />
              {tNav("status")}
            </span>
          </div>
        </div>

        <figure className="hero__portrait">
          <div className="hero__arch" data-reveal="clip" data-delay="0.25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(SITE.portrait, 1200)} alt={tMeta("name")} fetchPriority="high" />
          </div>
          <span className="hero__arch-line" aria-hidden="true" />
          <svg className="hero__ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="hero-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text>
              <textPath href="#hero-ring">{ring}</textPath>
            </text>
            <path className="hero__ring-arrow" d="M100 82 V118 M88 106 L100 118 L112 106" />
          </svg>
        </figure>
      </div>
    </section>
  );
}
