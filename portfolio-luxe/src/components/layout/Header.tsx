"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useLuxe } from "@/components/motion/LuxeProvider";
import { stripLocale, localizeHref } from "@/i18n/localize";
import { SITE } from "@/content/site";
import { BrandIcon } from "@/components/ui/BrandIcon";

const LINKS = [
  { key: "work", href: "/work" },
  { key: "about", href: "/#about" },
  { key: "process", href: "/#process" },
  { key: "cv", href: "/cv" },
  { key: "contact", href: "/#contact" },
] as const;

const SOCIAL = ["behance", "dribbble", "linkedin"] as const;

export function Header() {
  const t = useTranslations("nav");
  const tLuxe = useTranslations("luxe");
  const locale = useLocale();
  const { navigate, switchLocale, lenis } = useLuxe();
  const path = stripLocale(usePathname());
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Cairo",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (open) lenis()?.stop();
    else lenis()?.start();
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  // close the menu whenever the route changes
  useEffect(() => setOpen(false), [path]);

  const go = (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setOpen(false);
    navigate(href);
  };

  const isCurrent = (href: string) => !href.includes("#") && path.startsWith(href);

  return (
    <>
      <header className="hdr">
        <a href={localizeHref("/", locale)} onClick={go("/")} className="hdr__mark" dir="ltr" aria-label="Yaser — home">
          YASER<sup>©</sup>
        </a>

        <nav className="hdr__nav" aria-label={t("menu")}>
          {LINKS.map((l) => (
            <a
              key={l.key}
              href={localizeHref(l.href, locale)}
              onClick={go(l.href)}
              className={`hdr__link${isCurrent(l.href) ? " is-current" : ""}`}
              aria-current={isCurrent(l.href) ? "page" : undefined}
            >
              <span data-text={t(l.key)}>{t(l.key)}</span>
            </a>
          ))}
        </nav>

        <div className="hdr__end">
          <span className="hdr__status">
            <i aria-hidden="true" />
            {t("status")}
          </span>
          <button type="button" className="hdr__lang" onClick={switchLocale} lang={locale === "ar" ? "en" : "ar"}>
            {t("lang")}
          </button>
          <button
            type="button"
            className={`hdr__burger${open ? " is-open" : ""}`}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="hdr__burger-txt">{open ? t("close") : t("menu")}</span>
            <span className="hdr__burger-icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div id="menu" className={`menu${open ? " is-open" : ""}`} aria-hidden={!open} inert={!open || undefined}>
        <nav className="menu__nav">
          {LINKS.map((l, i) => (
            <a
              key={l.key}
              href={localizeHref(l.href, locale)}
              onClick={go(l.href)}
              className="menu__link"
              style={{ "--i": i } as CSSProperties}
            >
              <span className="menu__n" dir="ltr">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="menu__t">
                <span>{t(l.key)}</span>
              </span>
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <div>
            <span className="eyebrow">{t("reach")}</span>
            <a href={`mailto:${SITE.email}`} className="menu__mail" dir="ltr">
              {SITE.email}
            </a>
          </div>
          <div>
            <span className="eyebrow">{t("follow")}</span>
            <div className="menu__social">
              {SOCIAL.map((s) => (
                <a key={s} href={SITE.social[s]} target="_blank" rel="noopener" aria-label={s}>
                  <BrandIcon name={s} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <span className="eyebrow">{tLuxe("local")}</span>
            <span className="menu__time" dir="ltr">
              Cairo · {time}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
