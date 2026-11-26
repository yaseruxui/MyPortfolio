"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SITE } from "@/content/site";
import { img } from "@/utils/img";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Words } from "@/components/ui/Words";
import { SectionHead } from "@/components/ui/SectionHead";

const SOCIAL = [
  ["behance", "Behance"],
  ["dribbble", "Dribbble"],
  ["linkedin", "LinkedIn"],
] as const;

export function Contact({ n = "06" }: { n?: string }) {
  const t = useTranslations("contact");
  const tCursor = useTranslations("cursor");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <section className="cta sec" id="contact">
      <SectionHead n={n} label={t("label")} />
      <h2 className="cta__title display" data-reveal="lines">
        <Words text={t("l1")} as="span" className="cta__l1" />
        <Words text={t("l2")} as="em" className="cta__l2" />
      </h2>

      <div className="cta__mail" data-reveal="fade">
        <span className="eyebrow">{t("mailHint")}</span>
        <div className="cta__mail-row">
          <a href={`mailto:${SITE.email}`} className="cta__addr" dir="ltr" data-cursor={tCursor("hi")}>
            {SITE.email}
          </a>
          <button type="button" className="cta__copy" onClick={copy} aria-live="polite">
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>

      <div className="cta__actions" data-reveal="fade" data-delay="0.1">
        <a href={`https://wa.me/${SITE.whatsapp}`} className="btn btn--gold" target="_blank" rel="noopener">
          <span>{t("whatsapp")}</span>
          <i className="btn__arrow" aria-hidden="true" />
        </a>
        <a href={img(SITE.cv)} className="btn btn--line" download>
          <span>{t("cv")}</span>
          <i aria-hidden="true">↓</i>
        </a>
        <div className="cta__social">
          {SOCIAL.map(([k, label]) => (
            <a key={k} href={SITE.social[k]} target="_blank" rel="noopener" aria-label={label}>
              <BrandIcon name={k} />
            </a>
          ))}
        </div>
      </div>
      <p className="cta__note">{t("reply")}</p>
    </section>
  );
}
