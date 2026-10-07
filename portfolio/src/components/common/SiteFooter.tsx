"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useMotion } from "@/components/fx/MotionProvider";

export function SiteFooter() {
  const t = useTranslations("footer");
  const timeRef = useRef<HTMLSpanElement>(null);
  const { scrollTo } = useMotion();

  /* live Cairo clock (core.js tickTime) */
  useEffect(() => {
    const el = timeRef.current;
    if (!el) return;
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Cairo",
    });
    const tick = () => (el.textContent = fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="footer mono">
      <span>{t("rights")}</span>
      <span>
        <span>{t("city")}</span>{" "}
        <span className="js-time" dir="ltr" ref={timeRef}>
          --:--
        </span>
      </span>
      <a
        href="#top"
        className="link-roll"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById("top");
          if (el) scrollTo(el);
          else scrollTo(0);
        }}
      >
        <span data-text={t("top")}>{t("top")}</span>
      </a>
    </footer>
  );
}
