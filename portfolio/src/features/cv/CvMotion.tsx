"use client";

import { useLocale } from "next-intl";
import { gsap } from "@/lib/gsap";
import { useEntrance } from "@/hooks/useEntrance";
import type { Locale } from "@/types/content";

/** CV entrance + scroll choreography (cv.js intro/scroll). */
export function CvMotion() {
  const locale = useLocale() as Locale;
  const isRtl = locale === "ar";

  const intro = () =>
    gsap
      .timeline()
      .from(".cv-hero__photo", {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 1.3,
        ease: "expo.inOut",
      })
      .from(
        ".cv-name .char",
        { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.04 },
        0.3,
      )
      .from(
        ".cv-kicker, .cv-tagline, .cv-contact, .cv-dl",
        { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 },
        0.5,
      );

  const scroll = () => {
    gsap.to(".read-progress span", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: true },
    });

    gsap.utils.toArray<HTMLElement>(".cv-sec").forEach((sec) => {
      gsap.from(sec, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 88%" },
      });
    });
    gsap.utils.toArray<HTMLElement>(".cv-item").forEach((it) => {
      gsap.from(it, {
        x: isRtl ? 40 : -40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: it, start: "top 90%" },
      });
    });
    gsap.utils
      .toArray<HTMLElement>(".cv-course__track span")
      .forEach((bar) => {
        gsap.from(bar, {
          scaleX: 0,
          transformOrigin: isRtl ? "right" : "left",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: bar, start: "top 92%" },
        });
      });
  };

  useEntrance({ intro, scroll });
  return null;
}
