"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/env";
import { localizeHref, stripLocale } from "@/i18n/localize";

interface MotionContextValue {
  scrollTo: (target: string | number | HTMLElement, opts?: object) => void;
  /** navigate to a locale-agnostic href (e.g. "/work/meetx", "/#work") */
  navigate: (href: string) => void;
  /** toggle between ar/en on the current page, with the curtain */
  switchLocale: () => void;
  /** play the curtain cover, then run `action` */
  cover: (action: () => void) => void;
  getLenis: () => Lenis | null;
}

const MotionContext = createContext<MotionContextValue | null>(null);

export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion must be used within <MotionProvider>");
  return ctx;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const lenisRef = useRef<Lenis | null>(null);
  const navigatingRef = useRef(false);

  /* ---- Lenis smooth scroll + gsap ticker (ported from core.js) ---- */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const html = document.documentElement;
    const lenis = new Lenis({ lerp: 0.085 });
    lenisRef.current = lenis;

    let lastY = 0;
    lenis.on("scroll", () => {
      const y =
        (lenis as unknown as { animatedScroll?: number }).animatedScroll ??
        window.scrollY;
      // scroll-up drives the bottom fade: only while scrolling up, and not
      // near the top (so it never covers the hero on first load)
      if (y > lastY + 2) {
        html.classList.add("scroll-down");
        html.classList.remove("scroll-up");
      } else if (y < lastY - 2) {
        html.classList.remove("scroll-down");
        html.classList.toggle("scroll-up", y > 120);
      }
      lastY = y;
    });

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // import ScrollTrigger side-effect + bind update
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      lenis.on("scroll", ScrollTrigger.update);
      ScrollTrigger.refresh();
    });

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const getLenis = useCallback(() => lenisRef.current, []);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, opts: object = {}) => {
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(target as never, { duration: 1.6, ...opts });
      else if (typeof target !== "number")
        (target as HTMLElement).scrollIntoView?.();
    },
    [],
  );

  /* ---- page-transition curtain cover (replaces full-reload leave()) ---- */
  const curtain = () => document.querySelector<HTMLElement>(".curtain");
  const mark = () => document.querySelector<HTMLElement>(".curtain__mark");

  const cover = useCallback((action: () => void) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    try {
      sessionStorage.setItem("transition", "1");
    } catch {}
    lenisRef.current?.stop();

    if (prefersReducedMotion()) {
      action();
      return;
    }
    gsap
      .timeline()
      .set(curtain(), { clipPath: "inset(100% 0% 0% 0%)" })
      .to(curtain(), {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "expo.inOut",
      })
      .from(
        mark(),
        { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" },
        "-=0.35",
      )
      .add(action, "+=0.1");
  }, []);

  const navigate = useCallback(
    (href: string) => cover(() => router.push(localizeHref(href, locale))),
    [cover, router, locale],
  );

  const switchLocale = useCallback(() => {
    const next = locale === "ar" ? "en" : "ar";
    const bare = stripLocale(pathname);
    cover(() => router.push(localizeHref(bare, next)));
  }, [cover, router, locale, pathname]);

  // Reset the navigation guard once the new route has mounted.
  // The curtain *uncover* + intro are owned by each page via useEntrance().
  useEffect(() => {
    navigatingRef.current = false;
  });

  // Delegated smooth-scroll for same-page hash links (core.js initLinks).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      e.preventDefault();
      scrollTo(target);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  return (
    <MotionContext.Provider
      value={{ scrollTo, navigate, switchLocale, cover, getLenis }}
    >
      {children}
    </MotionContext.Provider>
  );
}
