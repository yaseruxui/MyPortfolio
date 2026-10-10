"use client";

import { useLocale } from "next-intl";
import { gsap } from "@/lib/gsap";
import { useEntrance } from "@/hooks/useEntrance";
import { splitWords } from "@/lib/split";
import { titleReveals } from "@/lib/scroll-helpers";
import { dirSign } from "@/lib/env";
import type { Locale } from "@/types/content";

/** Case-study entrance + scroll choreography (case.js intro/scroll). */
export function CaseMotion() {
  const locale = useLocale() as Locale;
  const isRtl = locale === "ar";
  const DIR = dirSign(isRtl);

  const intro = () =>
    gsap
      .timeline()
      .from(".c-hero__title .char", {
        yPercent: 115,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.035,
      })
      .from(
        ".c-hero__top, .c-hero__cat, .c-hero__tagline",
        { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08 },
        0.3,
      )
      .from(
        ".c-meta > div",
        { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 },
        0.5,
      )
      .from(
        ".c-cover",
        { y: 120, opacity: 0, duration: 1.4, ease: "expo.out" },
        0.4,
      );

  const scroll = () => {
    gsap.to(".read-progress span", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: true },
    });

    gsap.fromTo(
      ".c-cover",
      { clipPath: "inset(0% 6% 0% 6% round 14px)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        ease: "none",
        scrollTrigger: {
          trigger: ".c-cover",
          start: "top 90%",
          end: "top 10%",
          scrub: true,
        },
      },
    );
    gsap.fromTo(
      ".c-cover img",
      { scale: 1.25 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".c-cover",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    const overview = document.querySelector<HTMLElement>(".c-overview");
    if (overview) {
      const words = splitWords(overview, isRtl);
      gsap.to(words, {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: ".c-overview",
          start: "top 80%",
          end: "bottom 45%",
          scrub: 0.5,
        },
      });
    }

    gsap.utils.toArray<HTMLElement>(".c-shot").forEach((shot) => {
      gsap.from(shot, {
        y: 70,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: shot, start: "top 88%" },
      });
      const im = shot.querySelector("img");
      if (im)
        gsap.fromTo(
          im,
          { scale: 1.15 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: shot,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
    });

    gsap.from(".c-aside__inner > *", {
      y: 24,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.1,
      clearProps: "opacity,transform",
      scrollTrigger: { trigger: ".c-body", start: "top 80%" },
    });
    titleReveals(".c-next__title");

    const nextEl = document.querySelector<HTMLElement>(".c-next");
    const im = nextEl?.querySelector<HTMLElement>(".c-next__img");
    if (nextEl && im) {
      const xTo = gsap.quickTo(im, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(im, "y", { duration: 0.6, ease: "power3" });
      nextEl.addEventListener("mousemove", (e) => {
        const r = nextEl.getBoundingClientRect();
        xTo(e.clientX - r.left - im.offsetWidth / 2);
        yTo(e.clientY - r.top - im.offsetHeight / 2);
      });
      nextEl.addEventListener("mouseenter", () =>
        gsap.to(im, {
          opacity: 1,
          scale: 1,
          rotate: 4 * DIR,
          duration: 0.6,
          ease: "power3.out",
        }),
      );
      nextEl.addEventListener("mouseleave", () =>
        gsap.to(im, {
          opacity: 0,
          scale: 0.8,
          rotate: 0,
          duration: 0.5,
          ease: "power3.out",
        }),
      );
    }
  };

  useEntrance({ intro, scroll });
  return null;
}
