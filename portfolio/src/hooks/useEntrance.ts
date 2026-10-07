"use client";

import { useLocale } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/components/fx/MotionProvider";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { prefersReducedMotion } from "@/lib/env";
import { splitChars } from "@/lib/split";
import { curtainOut, runLoader } from "@/lib/entrance";

export interface EntranceConfig {
  /** builds the entrance timeline (reads .char etc.) */
  intro?: () => gsap.core.Timeline;
  /** registers ScrollTriggers for the page */
  scroll?: () => void;
  /** run the first-visit logo preloader (home only) */
  loader?: boolean;
}

/**
 * Per-page boot sequence — faithful port of core.js App.start()'s fonts.ready
 * block: split headings, build triggers, then either run the loader, play the
 * curtain uncover + intro (transition arrival), or just the intro.
 * Everything is scoped in a gsap.context so it reverts cleanly on unmount.
 */
export function useEntrance({ intro, scroll, loader = false }: EntranceConfig) {
  const locale = useLocale();
  const { getLenis, scrollTo } = useMotion();
  const isRtl = locale === "ar";

  useIsomorphicLayoutEffect(() => {
    const reduce = prefersReducedMotion();
    let killed = false;

    const ctx = gsap.context(() => {
      // Split headings synchronously so intro()/scroll() can target .char
      document
        .querySelectorAll<HTMLElement>(".js-split")
        .forEach((el) => splitChars(el, isRtl));
    });

    document.fonts.ready.then(() => {
      if (killed) return;
      // ctx.add() records everything built here (ScrollTriggers, from()
      // tweens, intro/loader timelines) so ctx.revert() on unmount kills the
      // triggers and restores inline styles. Built outside the context, they
      // leaked across client navigations / Fast Refresh: dead triggers piled
      // up, and on re-mount a from() would read the leftover opacity:0 as its
      // end state — leaving sections invisible until a full reload.
      ctx.add(() => {
        if (scroll && !reduce) scroll();

        const html = document.documentElement;
        let entering = html.classList.contains("has-curtain");
        try {
          if (sessionStorage.getItem("transition") === "1") entering = true;
          sessionStorage.removeItem("transition");
        } catch {}

        const done = () => {
          getLenis()?.start();
          if (location.hash) {
            const t = document.querySelector<HTMLElement>(location.hash);
            if (t) scrollTo(t, { immediate: true });
          }
        };

        if (entering || !loader || reduce) {
          document.querySelector(".loader")?.remove();
          const tl = gsap.timeline({ onStart: done });
          if (entering) tl.add(curtainOut());
          if (intro) tl.add(intro(), entering ? "-=0.6" : 0);
        } else {
          runLoader(intro, done);
        }
        ScrollTrigger.refresh();
      });
    });

    return () => {
      killed = true;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
