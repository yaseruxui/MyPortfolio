import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/env";

/** Animated number counter, supports decimals (core.js counter). */
export function counter(el: HTMLElement, trigger?: Element): void {
  const raw = el.dataset.to ?? "0";
  const to = parseFloat(raw);
  const dec = (raw.split(".")[1] ?? "").length;
  const o = { v: 0 };
  if (prefersReducedMotion()) {
    el.textContent = to.toFixed(dec);
    return;
  }
  gsap.to(o, {
    v: to,
    duration: 2,
    ease: "power2.out",
    scrollTrigger: { trigger: trigger ?? el, start: "top 85%" },
    onUpdate: () => (el.textContent = o.v.toFixed(dec)),
  });
}

/** Rising character reveal for split headings (core.js titleReveals). */
export function titleReveals(selector: string): void {
  if (prefersReducedMotion()) return;
  document.querySelectorAll<HTMLElement>(selector).forEach((title) => {
    gsap.from(title.querySelectorAll(".char"), {
      yPercent: 115,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.03,
      scrollTrigger: { trigger: title, start: "top 82%" },
    });
  });
}
