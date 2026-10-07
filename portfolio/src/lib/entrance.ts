import { gsap } from "@/lib/gsap";

/** Uncover animation after arriving through a page transition (core.js curtainOut). */
export function curtainOut(): gsap.core.Timeline {
  const html = document.documentElement;
  const curtain = document.querySelector<HTMLElement>(".curtain");
  return gsap
    .timeline()
    .to(".curtain__mark", {
      y: -30,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
    })
    .to(
      curtain,
      { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "expo.inOut" },
      "-=0.1",
    )
    .add(() => html.classList.remove("has-curtain"));
}

/**
 * First-visit logo preloader: "YASER ABU MUSTAFA." types out, everything but the
 * initials folds away into "YA.", then the mark flies into the nav logo while
 * the backdrop lifts.
 */
export function runLoader(
  intro: (() => gsap.core.Timeline) | undefined,
  done: () => void,
): void {
  const mark = document.querySelector<HTMLElement>(".loader__mark");
  const logo = document.querySelector<HTMLElement>(".nav__logo");
  // the real logo stays hidden until the mark lands on it
  if (logo) gsap.set(logo, { autoAlpha: 0 });

  // per-letter inline-blocks lose the Y–A kerning pair; it's eased back in as
  // the initials meet, so "YA." matches the nav logo glyph for glyph and the
  // hand-off doesn't jump
  // (in em, since the font grows while folding)
  const fontSize = mark ? parseFloat(getComputedStyle(mark).fontSize) : 0;
  const kept = mark ? [...mark.querySelectorAll<HTMLElement>(".lm-k")] : [];
  let kern = 0;
  if (mark && kept[0] && kept[1]) {
    const probe = document.createElement("span");
    probe.textContent = "YA";
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap";
    mark.appendChild(probe);
    const kerned = probe.getBoundingClientRect().width;
    probe.remove();
    kern =
      (kerned -
        kept[0].getBoundingClientRect().width -
        kept[1].getBoundingClientRect().width) /
      fontSize;
  }

  const finish = () => {
    if (logo) gsap.set(logo, { autoAlpha: 1 });
    document.querySelector(".loader")?.remove();
    done();
  };

  /* FLIP: measured lazily (when the fly tween starts) once "YA." has
     settled, so the target fits exactly. No visible logo → just lift away. */
  let flip: { x: number; y: number; scale: number; opacity: number } | undefined;
  const measure = () => {
    if (flip) return flip;
    const to = logo?.getBoundingClientRect();
    if (!mark || !logo || !to?.width) {
      return (flip = { x: 0, y: -40, scale: 1, opacity: 0 });
    }
    const from = mark.getBoundingClientRect();
    const scale =
      parseFloat(getComputedStyle(logo).fontSize) /
      parseFloat(getComputedStyle(mark).fontSize);
    return (flip = {
      x: to.left - from.left,
      y: to.top + to.height / 2 - (from.top + (from.height * scale) / 2),
      scale,
      opacity: 1,
    });
  };

  const tl = gsap.timeline();

  /* 1 — the full name types itself out, caret leading */
  const caret = mark?.querySelector<HTMLElement>(".lm-caret");
  const chars = mark ? [...mark.querySelectorAll<HTMLElement>(".lm-l")] : [];
  let t = 0.3;
  chars.forEach((el, i) => {
    // a beat before each new word
    if (el.parentElement?.previousElementSibling?.classList.contains("lm-sp")) t += 0.1;
    tl.set(el, { opacity: 1 }, t);
    if (caret) tl.set(caret, { x: el.offsetLeft + el.offsetWidth + fontSize * 0.04 }, t);
    // slightly uneven rhythm reads as typing rather than a stagger
    t += 0.035 + ((i * 7) % 5) * 0.008;
  });

  tl.to(caret ?? [], { autoAlpha: 0, duration: 0.12 }, t + 0.35).addLabel("fold", t + 0.45);

  /* 2 — the words contract: every letter but the initials shrinks away in
     place (its box narrowing as it fades), each word collapsing from its end
     back into its initial, so "Y" and "A" are drawn together. Then the dot
     lands and "YA." settles into a slightly larger mark. */
  const shrink = { duration: 0.6, ease: "power3.inOut" };
  mark?.querySelectorAll<HTMLElement>(".lm-c").forEach((group) => {
    const pieces = [...group.children] as HTMLElement[];
    const stagger = { each: 0.028, from: "end" as const };
    tl.to(pieces, { width: 0, ...shrink, stagger }, "fold").to(
      pieces.map((p) => p.firstElementChild).filter(Boolean),
      { opacity: 0, scale: 0.4, filter: "blur(4px)", ...shrink, stagger },
      "fold",
    );
  });

  tl
    .to(kept.slice(1), { marginLeft: `${kern}em`, ...shrink, duration: 0.8 }, "fold")
    .to(".lm-dot", { scale: 1, duration: 0.45, ease: "back.out(2.6)" }, "fold+=0.55")
    .to(mark, { fontSize: fontSize * 1.8, duration: 0.65, ease: "expo.inOut" }, "fold+=0.65")
    /* 3 — "YA." scales down into the nav logo as the backdrop lifts */
    .addLabel("fly", "+=0.15");

  tl
    .to(
      mark,
      {
        x: () => measure().x,
        y: () => measure().y,
        scale: () => measure().scale,
        opacity: () => measure().opacity,
        duration: 0.95,
        ease: "expo.inOut",
      },
      "fly",
    )
    .to(
      ".loader__bg",
      { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" },
      "fly+=0.06",
    )
    .add(intro ? intro() : gsap.timeline(), "fly+=0.3")
    .add(finish, "fly+=0.95");
}
