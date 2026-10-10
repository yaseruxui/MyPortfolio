"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { PROJECTS, projectCategory } from "@/content/projects";
import type { Locale, ProjectType } from "@/types/content";
import { img } from "@/utils/img";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { NdaCard, NdaCountdown, NdaModal, useNdaAccess } from "./NdaGate";

const pad = (n: number) => String(n).padStart(2, "0");
const TYPE_ORDER: ProjectType[] = ["app", "web", "brand"];

/**
 * Filterable project grid (tabs pill + animated filtering + 3D tilt cards).
 * Shared by the home "Selected work" section and the /work archive page.
 * The consumer wraps this in a <section className="work"> and supplies the
 * left-hand header (label + title).
 */
export function ProjectGrid({ header }: { header: ReactNode }) {
  const t = useTranslations("work");
  const tCursor = useTranslations("cursor");
  const locale = useLocale() as Locale;
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const nda = useNdaAccess();

  const types: Array<"all" | ProjectType> = [
    "all",
    ...TYPE_ORDER.filter((ty) => PROJECTS.some((p) => p.type === ty)),
  ];
  const countFor = (ty: "all" | ProjectType) =>
    ty === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.type === ty).length;

  /* ---- tabs (pill slide + animated filtering) + 3D tilt — core home.js ---- */
  useEffect(() => {
    const wrap = wrapRef.current;
    const grid = gridRef.current;
    if (!wrap || !grid) return;

    const ctx = gsap.context(() => {
      const pill = wrap.querySelector<HTMLElement>(".tabs__pill");
      const cards = gsap.utils.toArray<HTMLElement>(".project", grid);

      const movePill = (tab: HTMLElement, instant?: boolean) => {
        const r = tab.getBoundingClientRect();
        const w = wrap.getBoundingClientRect();
        gsap.to(pill, {
          x: r.left - w.left + wrap.scrollLeft,
          width: r.width,
          duration: instant ? 0 : 0.55,
          ease: "expo.out",
        });
      };

      const onTabClick = (e: Event) => {
        const tab = (e.target as HTMLElement).closest<HTMLElement>(".tab");
        if (!tab || tab.classList.contains("is-active")) return;
        const prev = wrap.querySelector(".is-active");
        prev?.classList.remove("is-active");
        prev?.setAttribute("aria-selected", "false");
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        movePill(tab);
        const f = tab.dataset.filter!;
        const visible = cards.filter((c) => !c.classList.contains("is-hidden"));
        gsap.to(visible, {
          opacity: 0,
          y: 20,
          duration: 0.25,
          ease: "power2.in",
          stagger: 0.03,
          onComplete: () => {
            cards.forEach((c) =>
              c.classList.toggle("is-hidden", f !== "all" && c.dataset.type !== f),
            );
            const shown = cards.filter((c) => !c.classList.contains("is-hidden"));
            gsap.fromTo(
              shown,
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
                stagger: 0.05,
                // same reason as ArchiveMotion: a left-over inline transform
                // would override the card's :hover lift
                clearProps: "opacity,transform",
              },
            );
            ScrollTrigger.refresh();
          },
        });
      };

      wrap.addEventListener("click", onTabClick);
      const active = wrap.querySelector<HTMLElement>(".is-active");
      document.fonts.ready.then(() => active && movePill(active, true));
      const onResize = () => {
        const a = wrap.querySelector<HTMLElement>(".is-active");
        if (a) movePill(a, true);
      };
      window.addEventListener("resize", onResize);

      /* 3D tilt (follows the pointer, spring-eased) */
      const coarse = matchMedia("(pointer: coarse)").matches;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tiltCleanups: Array<() => void> = [];
      if (!coarse && !reduce) {
        const AMP = 12;
        grid
          .querySelectorAll<HTMLElement>(".project:not(.project--nda) .project__media")
          .forEach((media) => {
          let tx = 0,
            ty = 0,
            ts = 1,
            cx = 0,
            cy = 0,
            cs = 1;
          let raf: number | null = null;
          let activeTilt = false;
          const loop = () => {
            cx += (tx - cx) * 0.12;
            cy += (ty - cy) * 0.12;
            cs += (ts - cs) * 0.12;
            const settled =
              Math.abs(tx - cx) < 0.02 &&
              Math.abs(ty - cy) < 0.02 &&
              Math.abs(ts - cs) < 0.001;
            if (!activeTilt && settled) {
              media.style.transform = "";
              raf = null;
              return;
            }
            media.style.transform = `perspective(900px) rotateX(${cy}deg) rotateY(${cx}deg) scale(${cs})`;
            raf = requestAnimationFrame(loop);
          };
          const start = () => {
            if (!raf) raf = requestAnimationFrame(loop);
          };
          const move = (e: PointerEvent) => {
            const r = media.getBoundingClientRect();
            tx = ((e.clientX - r.left) / r.width - 0.5) * AMP * 2;
            ty = -((e.clientY - r.top) / r.height - 0.5) * AMP * 2;
            ts = 1.04;
            activeTilt = true;
            start();
          };
          const leave = () => {
            tx = 0;
            ty = 0;
            ts = 1;
            activeTilt = false;
            start();
          };
          media.addEventListener("pointermove", move);
          media.addEventListener("pointerleave", leave);
          tiltCleanups.push(() => {
            media.removeEventListener("pointermove", move);
            media.removeEventListener("pointerleave", leave);
            if (raf) cancelAnimationFrame(raf);
          });
        });
      }

      return () => {
        wrap.removeEventListener("click", onTabClick);
        window.removeEventListener("resize", onResize);
        tiltCleanups.forEach((c) => c());
      };
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="work__head">
        {header}
        <div className="tabs js-tabs" role="tablist" ref={wrapRef}>
          <span className="tabs__pill" />
          {types.map((ty, i) => (
            <button
              key={ty}
              className={`tab${i === 0 ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={i === 0}
              data-filter={ty}
            >
              {t(`tabs.${ty}`)}
              <span className="tab__n" dir="ltr">
                {pad(countFor(ty))}
              </span>
            </button>
          ))}
        </div>
        {nda.unlocked && nda.expiresAt && <NdaCountdown expiresAt={nda.expiresAt} />}
      </div>

      <div className="work__grid js-projects" ref={gridRef}>
        {PROJECTS.map((p) => {
          const cat = projectCategory(p, locale, t(`type.${p.type}`));
          // every project now has its own page; outward links live on it
          const href = `/work/${p.slug}`;
          const go = `${tCursor("view")} ${locale === "ar" ? "←" : "→"}`;
          const badges = (
            <>
              <span className="project__chip">{cat}</span>
              {p.featured && (
                <span className="project__chip project__chip--featured">★ {t("featured")}</span>
              )}
            </>
          );
          const info = (
            <div className="project__info">
              <h3 dir="ltr">{p.title}</h3>
              <span className="project__meta" dir="ltr">
                {p.year}
              </span>
            </div>
          );

          // NDA: blurred cover behind a password gate (see NdaGate)
          if (p.nda) {
            return (
              <NdaCard key={p.slug} project={p} category={cat} info={info} access={nda} />
            );
          }

          const media = (
            <>
              <div className="project__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(p.images.thumb ?? p.images.cover)} alt={p.title} loading="lazy" />
                {badges}
                <span className="project__view mono">{go}</span>
              </div>
              {info}
            </>
          );
          return (
            <TransitionLink
              key={p.slug}
              href={href}
              className="project"
              data-type={p.type}
              data-cursor-label={tCursor("view")}
            >
              {media}
            </TransitionLink>
          );
        })}
      </div>

      <NdaModal access={nda} />
    </>
  );
}
