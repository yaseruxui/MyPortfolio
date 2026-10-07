import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { SITE } from "@/content/site";
import { img } from "@/utils/img";
import { SplitText } from "@/components/ui/SplitText";
import { ContactMail } from "./ContactMail";
import { ShapeGrid } from "@/components/fx/ShapeGrid";
import { SOCIAL_PATHS } from "@/content/tool-icons";
import { BrandIcon } from "@/components/ui/BrandIcon";

const SOCIAL = [
  { key: "behance", label: "Behance" },
  { key: "dribbble", label: "Dribbble" },
  { key: "linkedin", label: "LinkedIn" },
] as const;

export function Contact() {
  const t = useTranslations("contact");
  const tc = useTranslations("cursor");

  return (
    <section className="contact" id="contact">
      <div className="bg-grid" aria-hidden="true">
        <ShapeGrid direction="up" squareSize={72} />
      </div>
      <span className="label mono">{t("label")}</span>
      <h2 className="contact__title">
        <span className="line">
          <SplitText className="js-split" text={t("l1")} />
        </span>
        <span className="line">
          <SplitText as="em" className="serif neon js-split" text={t("l2")} />
        </span>
      </h2>

      <div className="contact__mail">
        <span className="contact__hint mono">{t("mailHint")}</span>
        <ContactMail
          email={SITE.email}
          labels={{ hi: tc("hi"), copy: t("copy"), copied: t("copied") }}
        />
      </div>

      <div className="contact__links">
        <div className="contact__actions">
          {SITE.whatsapp && (
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              className="btn btn--solid magnetic js-whatsapp"
              target="_blank"
              rel="noopener"
            >
              <BrandIcon name="whatsapp" />
              <span>{t("whatsapp")}</span>
            </a>
          )}
          <a href={img(SITE.cv)} className="btn magnetic js-cv" download>
            <span>{t("cv")}</span> <i aria-hidden="true">↓</i>
          </a>
        </div>
        <div className="contact__side">
          <div className="contact__social">
            {SOCIAL.filter((s) => SITE.social[s.key]).map((s) => (
              <a
                key={s.key}
                href={SITE.social[s.key]}
                className="social js-social"
                target="_blank"
                rel="noopener"
                style={{ "--brand": SOCIAL_PATHS[s.key]!.hex } as CSSProperties}
              >
                <BrandIcon name={s.key} />
                <span dir="ltr">{s.label}</span>
              </a>
            ))}
          </div>
          <span className="contact__reply mono">{t("reply")}</span>
        </div>
      </div>
    </section>
  );
}
