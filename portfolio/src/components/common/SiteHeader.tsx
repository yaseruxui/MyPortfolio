"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/components/fx/MotionProvider";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { SITE } from "@/content/site";
import { PROJECTS } from "@/content/projects";
import { img } from "@/utils/img";
import { SOCIAL_PATHS } from "@/content/tool-icons";
import { BrandIcon } from "@/components/ui/BrandIcon";

// same order as the sections on the home page; "work" and "cv" are pages
const SECTIONS = [
  { id: "about", num: "01" },
  { id: "work", num: "02" },
  { id: "process", num: "03" },
  { id: "cv", num: "04" },
  { id: "contact", num: "05" },
] as const;
const PAGES: Record<string, string> = { work: "/work", cv: "/cv" };
const SOCIAL = [
  { key: "behance", label: "Behance" },
  { key: "dribbble", label: "Dribbble" },
  { key: "linkedin", label: "LinkedIn" },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function SiteHeader() {
  const t = useTranslations("nav");
  const tContact = useTranslations("contact");
  const tFooter = useTranslations("footer");
  const { scrollTo, navigate, switchLocale, getLenis } = useMotion();
  const pathname = usePathname();
  // locale-less path, e.g. "/en/work/meetx" -> "/work/meetx"
  const path = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  const isCurrent = (id: string) => !!PAGES[id] && path.startsWith(PAGES[id]!);

  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("--:--");

  /* build the menu open/close timeline once */
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const ctx = gsap.context(() => {
      tlRef.current = gsap
        .timeline({ paused: true })
        .set(menu, { visibility: "visible" })
        .to(menu, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut" })
        .from(".menu__text", { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.06 }, "-=0.35")
        .from(".menu__num, .menu__sup", { opacity: 0, duration: 0.6, stagger: 0.04 }, "-=0.7")
        .from(".menu__aside > *, .menu__foot", { y: 24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 }, "-=0.75");
    }, menu);
    return () => ctx.revert();
  }, []);

  /* Cairo clock in the menu footer */
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  const toggle = (state: boolean, { restoreFocus = true } = {}) => {
    setOpen(state);
    document.documentElement.classList.toggle("menu-open", state);
    const tl = tlRef.current;
    if (state) {
      getLenis()?.stop();
      tl?.timeScale(1).play();
      // keyboard users land on the first link
      window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>(".menu__link")?.focus({ preventScroll: true }), 450);
    } else {
      getLenis()?.start();
      tl?.timeScale(1.6).reverse();
      if (restoreFocus) burgerRef.current?.focus({ preventScroll: true });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) toggle(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const goSection = (id: string) => {
    if (open) toggle(false, { restoreFocus: false });
    // "work" and "cv" open their own pages; the others scroll to their section.
    if (PAGES[id]) {
      navigate(PAGES[id]);
      return;
    }
    const el = document.getElementById(id);
    if (el) scrollTo(el);
    else navigate(`/#${id}`);
  };

  return (
    <>
      <header className="nav">
        <TransitionLink href="/" className="nav__logo magnetic" aria-label="Home">
          YA<span className="dot" />
        </TransitionLink>
        <div className="nav__end">
          <button className="lang-toggle js-lang" type="button" onClick={switchLocale}>
            {t("lang")}
          </button>
          <button
            ref={burgerRef}
            className="burger js-burger magnetic"
            type="button"
            aria-label={open ? t("close") : t("menu")}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => toggle(!open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className="menu" id="menu" ref={menuRef} aria-hidden={!open} inert={!open}>
        <div className="menu__grid">
          <nav className="menu__links" aria-label={t("menu")}>
            {SECTIONS.map((s) => {
              const current = isCurrent(s.id);
              return (
                <a
                  key={s.id}
                  href={PAGES[s.id] ?? `#${s.id}`}
                  className={`menu__link${current ? " is-current" : ""}`}
                  aria-current={current ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    goSection(s.id);
                  }}
                >
                  <span className="menu__num mono">{s.num}</span>
                  <span className="menu__text">{t(s.id)}</span>
                  {s.id === "work" && (
                    <sup className="menu__sup mono" dir="ltr">
                      {pad(PROJECTS.length)}
                    </sup>
                  )}
                </a>
              );
            })}
          </nav>

          <aside className="menu__aside">
            <div className="menu__block">
              <span className="menu__label mono">{t("reach")}</span>
              <a href={`mailto:${SITE.email}`} className="menu__mail" dir="ltr">
                {SITE.email}
              </a>
              {SITE.whatsapp && (
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  className="social"
                  target="_blank"
                  rel="noopener"
                  style={{ "--brand": SOCIAL_PATHS.whatsapp!.hex } as CSSProperties}
                >
                  <BrandIcon name="whatsapp" />
                  <span>{tContact("whatsapp")}</span>
                </a>
              )}
            </div>
            <div className="menu__block">
              <span className="menu__label mono">{t("follow")}</span>
              <div className="menu__social">
                {SOCIAL.filter((s) => SITE.social[s.key]).map((s) => (
                  <a
                    key={s.key}
                    href={SITE.social[s.key]}
                    className="social"
                    target="_blank"
                    rel="noopener"
                    style={{ "--brand": SOCIAL_PATHS[s.key]!.hex } as CSSProperties}
                  >
                    <BrandIcon name={s.key} />
                    <span dir="ltr">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
            <a href={img(SITE.cv)} className="btn menu__cv" download>
              <span>{tContact("cv")}</span> <i aria-hidden="true">↓</i>
            </a>
          </aside>
        </div>

        <div className="menu__foot mono">
          <div className="nav__status">
            <i className="pulse" /> <span>{t("status")}</span>
          </div>
          <span>
            {tFooter("city")} <span dir="ltr">{time}</span>
          </span>
        </div>
      </div>
    </>
  );
}
