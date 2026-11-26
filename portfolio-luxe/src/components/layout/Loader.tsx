"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/env";
import { useLuxe } from "@/components/motion/LuxeProvider";

const KEY = "luxe-intro";
const LETTERS = "YASER".split("");

/** First-visit intro: a counter, a drawn hairline, then the veil lifts. */
export function Loader() {
  const t = useTranslations("loader");
  const { markReady } = useLuxe();
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {}

    if (seen || prefersReducedMotion()) {
      markReady();
      setGone(true);
      return;
    }

    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .from(".loader__l > span", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.07 })
        .from(".loader__meta", { opacity: 0, duration: 0.8 }, 0.2)
        .to(".loader__bar", { scaleX: 1, duration: 1.7, ease: "expo.inOut" }, 0.1)
        .to(
          counter,
          {
            v: 100,
            duration: 1.7,
            ease: "expo.inOut",
            onUpdate: () => {
              if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          0.1,
        )
        .to(".loader__l > span", { yPercent: -110, duration: 0.8, ease: "expo.in", stagger: 0.04 }, "+=0.1")
        .to(".loader__meta, .loader__bar", { opacity: 0, duration: 0.4 }, "<")
        .add(() => markReady(), "-=0.1")
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, "-=0.15");
    }, el);
    return () => ctx.revert();
  }, [markReady]);

  if (gone) return null;

  return (
    <div className="loader" data-loader ref={root} aria-hidden="true">
      <div className="loader__mark" dir="ltr">
        {LETTERS.map((l, i) => (
          <span className="loader__l" key={i}>
            <span>{l}</span>
          </span>
        ))}
      </div>
      <div className="loader__meta">
        <span>{t("a")}</span>
        <span className="loader__num" dir="ltr">
          <span ref={num}>000</span>
        </span>
        <span>{t("b")}</span>
      </div>
      <span className="loader__bar" />
    </div>
  );
}
