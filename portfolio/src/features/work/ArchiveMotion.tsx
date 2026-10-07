"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useEntrance } from "@/hooks/useEntrance";

/** Entrance + scroll choreography for the /work archive page. */
export function ArchiveMotion() {
  const intro = () =>
    gsap
      .timeline()
      .from(".section-title .char", {
        yPercent: 115,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.04,
      })
      .from(
        ".work__head .label, .tabs",
        { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 },
        0.3,
      );

  const scroll = () => {
    ScrollTrigger.batch(".project", {
      start: "top 92%",
      once: true,
      onEnter: (els) =>
        gsap.from(els, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
        }),
    });
  };

  useEntrance({ intro, scroll });
  return null;
}
