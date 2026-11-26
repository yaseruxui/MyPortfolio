"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/env";
import { localizeHref, stripLocale } from "@/i18n/localize";

interface LuxeContext {
  /** true once the intro (loader) has finished, so first reveals can play */
  ready: boolean;
  markReady: () => void;
  /** go to a locale-less href ("/work", "/#contact") behind the curtain */
  navigate: (href: string) => void;
  /** same page, other language */
  switchLocale: () => void;
  scrollTo: (target: string | number | HTMLElement, immediate?: boolean) => void;
  lenis: () => Lenis | null;
}

const Ctx = createContext<LuxeContext | null>(null);

export function useLuxe(): LuxeContext {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLuxe must be used inside <LuxeProvider>");
  return c;
}

/** Curtain timings (seconds). The page swap happens while it is closed. */
const IN = 0.85;
const OUT = 0.95;

export function LuxeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const lenisRef = useRef<Lenis | null>(null);
  const busy = useRef(false);
  const pendingHash = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  /* ------------------------- smooth scroll (Lenis) ------------------------- */
  useEffect(() => {
    const html = document.documentElement;
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;

    let last = 0;
    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      ScrollTrigger.update();
      // header hides on the way down, returns on the way up
      if (scroll > last + 4 && scroll > 160) html.classList.add("is-down");
      else if (scroll < last - 4) html.classList.remove("is-down");
      html.classList.toggle("is-scrolled", scroll > 40);
      last = scroll;
    });

    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* without Lenis (reduced motion) keep the header state working */
  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const html = document.documentElement;
    const onScroll = () => html.classList.toggle("is-scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* no intro on this page → reveals may start right away */
  useEffect(() => {
    if (!document.querySelector("[data-loader]")) setReady(true);
  }, []);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, immediate = false) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target as never, {
          immediate,
          duration: 1.8,
          offset: typeof target === "number" ? 0 : -24,
        });
        return;
      }
      if (typeof target === "number") window.scrollTo({ top: target });
      else {
        const el =
          typeof target === "string" ? document.querySelector(target) : target;
        el?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
      }
    },
    [],
  );

  /* ------------------------------ the curtain ------------------------------ */
  const curtain = () => document.querySelector<HTMLElement>("[data-curtain]");

  const closeThen = useCallback((action: () => void) => {
    if (busy.current) return;
    busy.current = true;
    lenisRef.current?.stop();
    const el = curtain();
    if (!el || prefersReducedMotion()) {
      action();
      return;
    }
    gsap
      .timeline({ onComplete: action })
      .set(el, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" })
      .to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: IN, ease: "expo.inOut" })
      .fromTo(
        el.querySelector("[data-curtain-line]"),
        { scaleX: 0 },
        { scaleX: 1, duration: IN * 0.8, ease: "expo.inOut" },
        0.15,
      );
  }, []);

  /* a new route has rendered: jump to the top (or the hash) and lift */
  useEffect(() => {
    const el = curtain();
    const hash = pendingHash.current;
    pendingHash.current = null;

    if (hash) {
      // give the new page a frame to lay out before measuring the target
      requestAnimationFrame(() => scrollTo(hash, true));
    } else {
      scrollTo(0, true);
    }
    ScrollTrigger.refresh();

    if (!busy.current) return;
    lenisRef.current?.start();
    if (!el || prefersReducedMotion()) {
      busy.current = false;
      return;
    }
    gsap
      .timeline({
        delay: 0.1,
        onComplete: () => {
          busy.current = false;
          gsap.set(el, { visibility: "hidden" });
        },
      })
      .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: OUT, ease: "expo.inOut" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      const [path = "/", hash] = href.split("#");
      const here = stripLocale(pathname);
      // same page + hash → just glide there
      if (hash && (path || "/") === here) {
        scrollTo(`#${hash}`);
        return;
      }
      if ((path || "/") === here && !hash) {
        scrollTo(0);
        return;
      }
      pendingHash.current = hash ? `#${hash}` : null;
      closeThen(() => router.push(localizeHref(path || "/", locale), { scroll: false }));
    },
    [pathname, locale, router, closeThen, scrollTo],
  );

  const switchLocale = useCallback(() => {
    const other = locale === "ar" ? "en" : "ar";
    const target = localizeHref(stripLocale(pathname), other);
    // a locale swap re-renders the whole tree (dir, fonts) — do it behind the curtain
    closeThen(() => {
      window.location.assign(target);
    });
  }, [locale, pathname, closeThen]);

  const markReady = useCallback(() => setReady(true), []);
  const lenis = useCallback(() => lenisRef.current, []);

  return (
    <Ctx.Provider
      value={{
        ready,
        markReady,
        navigate,
        switchLocale,
        scrollTo,
        lenis,
      }}
    >
      {children}
      <div className="curtain" data-curtain aria-hidden="true">
        <span className="curtain__mark">YASER</span>
        <span className="curtain__line" data-curtain-line />
      </div>
    </Ctx.Provider>
  );
}
