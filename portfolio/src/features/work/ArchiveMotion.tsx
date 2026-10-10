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
          /* keep the travel under the grid's row-gap (22–34px): a taller rise
             leaves the card — and its title — sitting over the row below while
             it settles */
          y: 18,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.06,
          /* without this GSAP leaves an inline transform behind, and an inline
             style outranks the stylesheet — killing .project:hover's lift */
          clearProps: "opacity,transform",
        }),
    });
  };

  useEntrance({ intro, scroll });
  return null;
}
