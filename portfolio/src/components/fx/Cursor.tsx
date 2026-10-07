"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { hasFinePointer } from "@/lib/env";

/**
 * Custom cursor + ambient glow + magnetic buttons.
 * Ported from core.js initCursor(); re-binds on every route change so newly
 * mounted links/buttons get the hover + magnetic behaviour.
 */
export function Cursor() {
  const pathname = usePathname();

  useEffect(() => {
    if (!hasFinePointer()) return;
    const cursor = document.querySelector<HTMLElement>(".cursor");
    const label = cursor?.querySelector<HTMLElement>(".cursor__label");
    const glow = document.querySelector<HTMLElement>(".glow");
    if (!cursor || !label || !glow) return;

    const cx = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3" });
    const gx = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power3" });
    const gy = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      cx(e.clientX);
      cy(e.clientY);
      gx(e.clientX);
      gy(e.clientY);
    };
    window.addEventListener("mousemove", onMove);

    const cleanups: Array<() => void> = [];

    document.querySelectorAll<HTMLElement>("a, button").forEach((el) => {
      const enter = () => {
        const txt = el.dataset.cursorLabel;
        // over buttons the dot grows into a soft glass lens (no blend mode:
        // "difference" on a filled button reads as a dark smudge)
        if (el.matches(".btn, .cmail__copy, .social")) {
          cursor.classList.add("is-btn");
        } else if (txt) {
          label.textContent = txt;
          cursor.classList.add("is-label");
        } else {
          cursor.classList.add("is-hover");
        }
      };
      const leave = () => cursor.classList.remove("is-hover", "is-label", "is-btn");
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    });

    // magnetic pull only for small chrome (burger, logo) — buttons stay put
    document.querySelectorAll<HTMLElement>(".magnetic:not(.btn)").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", {
        duration: 0.8,
        ease: "elastic.out(1, 0.4)",
      });
      const yTo = gsap.quickTo(el, "y", {
        duration: 0.8,
        ease: "elastic.out(1, 0.4)",
      });
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      };
      const out = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", out);
      cleanups.push(() => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", out);
      });
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cleanups.forEach((c) => c());
      cursor.classList.remove("is-hover", "is-label", "is-btn");
    };
  }, [pathname]);

  return null;
}
