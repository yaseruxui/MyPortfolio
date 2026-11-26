"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/env";
import { useLuxe } from "./LuxeProvider";

/**
 * One scroll-motion system for every page, driven by data attributes so the
 * pages themselves stay server components:
 *
 *   data-reveal="lines"   words (from <Words/>) rise out of their masks
 *   data-reveal="fade"    soft rise + fade
 *   data-reveal="clip"    image unveils from the bottom while settling in scale
 *   data-reveal="rule"    hairline draws across
 *   data-reveal="read"    words brighten as you read (scrubbed)
 *   data-parallax="0.12"  drifts against the scroll
 *   data-count="48"       number counts up once
 *   data-delay="0.2"      extra delay for the first three kinds
 */
export function Reveals() {
  const pathname = usePathname();
  const { ready } = useLuxe();

  useEffect(() => {
    const root = document.documentElement;
    if (prefersReducedMotion()) {
      root.classList.add("reveal-off");
      return;
    }
    if (!ready) return;

    let ctx: gsap.Context;
    try {
      ctx = build();
    } catch {
      // never leave content hidden because an animation failed to set up
      root.classList.add("reveal-off");
      return;
    }

    function build() {
      return gsap.context(() => {
      const delay = (el: Element) => Number((el as HTMLElement).dataset.delay ?? 0);
      const trigger = (el: Element, start = "top 88%") => ({
        trigger: el,
        start,
        once: true,
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
        // explicit from-state: the CSS start (translateY 110%) is read back as px
        gsap.fromTo(el.querySelectorAll(".w > span"), { y: 0, yPercent: 112 }, {
          yPercent: 0,
          duration: 1.25,
          ease: "expo.out",
          stagger: 0.06,
          delay: delay(el),
          scrollTrigger: trigger(el),
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          delay: delay(el),
          scrollTrigger: trigger(el, "top 92%"),
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
        const media = el.querySelector("img, video");
        gsap
          .timeline({ delay: delay(el), scrollTrigger: trigger(el, "top 90%") })
          .fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
          )
          .fromTo(media, { scale: 1.18 }, { scale: 1, duration: 2, ease: "expo.out" }, 0.1);
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="rule"]').forEach((el) => {
        gsap.to(el, {
          scaleX: 1,
          duration: 1.6,
          ease: "expo.inOut",
          delay: delay(el),
          scrollTrigger: trigger(el, "top 95%"),
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="read"]').forEach((el) => {
        gsap.to(el.querySelectorAll(".rw"), {
          opacity: 1,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = Number(el.dataset.parallax) || 0.1;
        gsap.fromTo(
          el,
          { yPercent: -amt * 100 },
          {
            yPercent: amt * 100,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count) || 0;
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: trigger(el, "top 92%"),
          onUpdate: () => {
            el.textContent = String(Math.round(o.v));
          },
        });
      });
      });
    }

    // images arriving late change the layout; re-measure once they land
    const imgs = Array.from(document.images).filter((i) => !i.complete);
    let pending = imgs.length;
    const done = () => {
      pending -= 1;
      if (pending <= 0) ScrollTrigger.refresh();
    };
    imgs.forEach((i) => i.addEventListener("load", done, { once: true }));
    const late = window.setTimeout(() => ScrollTrigger.refresh(), 1200);

    return () => {
      window.clearTimeout(late);
      imgs.forEach((i) => i.removeEventListener("load", done));
      ctx.revert();
    };
  }, [pathname, ready]);

  return null;
}
