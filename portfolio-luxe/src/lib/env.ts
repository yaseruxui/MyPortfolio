/* Client-only environment/motion flags (mirror core.js). Call inside effects. */

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** horizontal motion sign: +1 for RTL, -1 for LTR (matches core.js DIR). */
export const dirSign = (isRtl: boolean): 1 | -1 => (isRtl ? 1 : -1);
