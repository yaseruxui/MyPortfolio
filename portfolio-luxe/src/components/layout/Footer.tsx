"use client";

import { useTranslations } from "next-intl";
import { useLuxe } from "@/components/motion/LuxeProvider";
import { SITE } from "@/content/site";
import { BrandIcon } from "@/components/ui/BrandIcon";

const SOCIAL = [
  ["behance", "Behance"],
  ["dribbble", "Dribbble"],
  ["linkedin", "LinkedIn"],
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tLuxe = useTranslations("luxe");
  const { scrollTo } = useLuxe();

  return (
    <footer className="ftr">
      <div className="ftr__row">
        <span>{t("rights")}</span>
        <span className="ftr__mid">
          {tLuxe("role")} · {t("city")}
        </span>
        <div className="ftr__social">
          {SOCIAL.map(([k, label]) => (
            <a key={k} href={SITE.social[k]} target="_blank" rel="noopener" aria-label={label}>
              <BrandIcon name={k} />
            </a>
          ))}
        </div>
        <button type="button" className="ftr__top" onClick={() => scrollTo(0)}>
          {t("top")}
        </button>
      </div>
      <div className="ftr__mark" dir="ltr" aria-hidden="true">
        <span>YASER</span>
      </div>
    </footer>
  );
}
