import { useLocale, useTranslations } from "next-intl";
import { SITE } from "@/content/site";
import { img } from "@/utils/img";
import { SplitText } from "@/components/ui/SplitText";
import { TransitionLink } from "@/components/ui/TransitionLink";
export function Hero() {
  const t = useTranslations("hero");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  // Arabic must keep its own shaping/direction on the circle; stretching it to
  // a fixed length (textLength) would add gaps between joined letters.
  const isAr = useLocale() === "ar";

  return (
    <section className="hero">
      <div className="hero__portrait" aria-hidden="true">
        {/* plain <img> (not next/image) to preserve the exact clip/scale
            entrance animation and guarantee zero visual drift; CLS is already
            prevented by the CSS aspect-ratio on .hero__portrait. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="js-portrait"
          src={img(SITE.portrait, 1100)}
          alt=""
          fetchPriority="high"
        />
      </div>
      <div className="hero__orb" aria-hidden="true" />

      <h1 className="hero__title">
        <span className="line">
          <SplitText className="serif js-split" text={t("l1")} />
        </span>
        <span className="line">
          <SplitText className="js-split" text={t("l2")} />
          <em className="neon hero__dot">.</em>
        </span>
      </h1>

      <div className="hero__bottom">
        <div className="hero__lead js-fade">
          <span className="hero__status mono">
            <i className="pulse" aria-hidden="true" /> {tNav("status")}
          </span>
          <p
            className="hero__intro"
            dangerouslySetInnerHTML={{ __html: t.raw("intro") as string }}
          />
          <div className="hero__ctas">
            <TransitionLink href="/work" className="btn btn--solid magnetic">
              <span>{t("ctaWork")}</span> <i aria-hidden="true">{isAr ? "←" : "→"}</i>
            </TransitionLink>
            <a href="#contact" className="btn magnetic">
              <span>{tContact("btn")}</span>
            </a>
          </div>
        </div>
        <a href="#about" className="hero__scroll js-fade" aria-label={t("scrollLabel")}>
          <span className="hero__scroll-ring">
            <svg viewBox="0 0 100 100">
              <defs>
                <path
                  id="circ"
                  d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
                />
              </defs>
              <text
                direction="ltr"
                {...(isAr ? {} : { textLength: 226, lengthAdjust: "spacing" })}
              >
                <textPath href="#circ">{t("scroll")}</textPath>
              </text>
            </svg>
          </span>
          <span className="hero__scroll-arrow">↓</span>
        </a>
      </div>
    </section>
  );
}
