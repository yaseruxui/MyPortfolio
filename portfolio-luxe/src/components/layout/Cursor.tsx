"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/env";

/** A champagne point with a trailing hairline ring; links widen it, labels fill it. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const d = dot.current!;
    const r = ring.current!;
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      html.classList.add("cursor-on");
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const lab = t?.closest<HTMLElement>("[data-cursor]");
      const hot = t?.closest("a, button, [role=button], input, label, summary");
      setLabel(lab?.dataset.cursor ?? "");
      html.classList.toggle("cursor-label", !!lab);
      html.classList.toggle("cursor-hot", !!hot && !lab);
    };
    const leave = () => html.classList.remove("cursor-on");
    const down = () => html.classList.add("cursor-down");
    const up = () => html.classList.remove("cursor-down");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      html.classList.remove("has-cursor", "cursor-on", "cursor-label", "cursor-hot");
    };
  }, []);

  // a new page never inherits the previous page's hover state
  useEffect(() => {
    setLabel("");
    document.documentElement.classList.remove("cursor-label", "cursor-hot");
  }, [pathname]);

  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span>{label}</span>
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
