"use client";

import { useLocale } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useEntrance } from "@/hooks/useEntrance";
import { splitWords } from "@/lib/split";
import { counter, titleReveals } from "@/lib/scroll-helpers";
import { dirSign } from "@/lib/env";
import type { Locale } from "@/types/content";

/** Runs the home-page entrance + scroll choreography (home.js intro/scroll). */
export function HomeMotion() {
  const locale = useLocale() as Locale;
  const isRtl = locale === "ar";
  const DIR = dirSign(isRtl);

  const intro = () =>
    gsap
      .timeline()
      .from(".hero__portrait", {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 1.6,
        ease: "expo.inOut",
      })
      .from(
        ".hero__portrait img",
        { scale: 1.35, duration: 2.2, ease: "expo.out" },
        0.2,
      )
      .from(
        ".hero__title .char, .hero__dot",
        {
          yPercent: 115,
          rotate: 6 * -DIR,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.05,
        },
        0.5,
      )
      .from(
        // on first visit the loader's "YA." lands on the logo itself
        document.querySelector(".loader")
          ? ".nav > *:not(.nav__logo)"
          : ".nav > *",
        { y: -20, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.06 },
        0.8,
      )
      .from(
        ".js-fade",
        { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12 },
        1,
      )
      .from(
        ".hero__orb",
        { scale: 0.4, opacity: 0, duration: 2, ease: "expo.out" },
        0.4,
      );

  const scroll = () => {
    /* Hero drift */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
      .to(".hero__title .line:first-child", { xPercent: 12 * DIR }, 0)
      .to(".hero__title .line:last-child", { xPercent: -10 * DIR }, 0)
      .to(".hero__title", { opacity: 0.15, filter: "blur(6px)" }, 0)
      .to(".hero__portrait", { yPercent: 18, opacity: 0.25 }, 0)
      .to(".hero__orb", { yPercent: 60, scale: 1.4 }, 0);

    /* Marquee: loop + velocity boost + direction flip
       (the 4 rows are rendered up-front by <Marquee>, no runtime cloning) */
    const track = document.querySelector<HTMLElement>(".marquee__track");
    if (track) {
      const loop = gsap.to(track, {
        xPercent: 25 * DIR,
        duration: 22,
        ease: "none",
        repeat: -1,
      });
      loop.totalTime(loop.duration() * 100);
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = Math.max(
            1,
            Math.min(Math.abs(self.getVelocity() / 300), 6),
          );
          gsap.to(loop, {
            timeScale: self.direction * v,
            duration: 0.3,
            overwrite: true,
          });
          gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.3 });
        },
      });
    }

    /* About: one pinned, scrubbed sequence — the words light up first, then
       the stats rise in and count up, all driven by the scroll (so the stats
       are hidden until the reader has scrolled into the section) */
    const revealEl = document.querySelector<HTMLElement>(".js-reveal-words");
    if (revealEl) {
      const words = splitWords(revealEl, isRtl);
      const aboutTl = gsap
        .timeline({
          scrollTrigger: {
            trigger: ".about__pin",
            start: "top top",
            end: "+=180%", // was 140% for the words alone; +40% for the stats
            scrub: 0.6,
            pin: true,
          },
        })
        .to(words, { opacity: 1, stagger: 0.1, ease: "none" });

      const statsDur = aboutTl.duration() * 0.3;
      const statsAt = aboutTl.duration();
      aboutTl.from(
        ".about__stats > div",
        { y: 50, opacity: 0, ease: "power2.out", duration: statsDur * 0.6, stagger: statsDur * 0.1 },
        statsAt,
      );
      // numbers are server-rendered at their real value (no-JS / reduced
      // motion / SEO); reset to 0 here and count up inside the same scrub
      document.querySelectorAll<HTMLElement>(".about__stats .js-num").forEach((el) => {
        const raw = el.dataset.to ?? "0";
        const dec = (raw.split(".")[1] ?? "").length;
        const o = { v: 0 };
        el.textContent = (0).toFixed(dec);
        aboutTl.to(
          o,
          { v: parseFloat(raw), ease: "power1.out", duration: statsDur, onUpdate: () => void (el.textContent = o.v.toFixed(dec)) },
          statsAt,
        );
      });
    }

    // any other counters on the page keep their own scroll trigger
    document
      .querySelectorAll<HTMLElement>(".js-num:not(.about__stats .js-num)")
      .forEach((el) => counter(el));
    titleReveals(".section-title, .contact__title");

    /* Process: horizontal timeline — line fills, nodes light up */
    const fill = document.querySelector<HTMLElement>(".ptl__fill");
    const psteps = gsap.utils.toArray<HTMLElement>(".pstep");
    gsap.from(psteps, {
      y: 50,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      clearProps: "transform",
      scrollTrigger: { trigger: ".stack", start: "top 82%" },
    });
    ScrollTrigger.create({
      trigger: ".stack",
      start: "top 68%",
      end: "bottom 72%",
      onUpdate: (self) => {
        const p = self.progress;
        if (fill) fill.style.setProperty("--p", p.toFixed(3));
        psteps.forEach((st, i) =>
          st.classList.toggle("is-active", p >= i / psteps.length + 0.02),
        );
      },
    });

    /* Testimonials: the line under the title, then the cards rise in */
    gsap.from(".tm-desc", {
      y: 24,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".tm-head", start: "top 75%" },
    });
    ScrollTrigger.batch(".tm-card", {
      start: "top 88%",
      once: true,
      onEnter: (els) =>
        gsap.from(els, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          clearProps: "opacity,transform",
        }),
    });

    /* Work story. Desktop: the block pins and the projects play one after
       another on a single stage — the next cover wipes up over the current
       one (which zooms and dims), the details hand over line by line, and the
       scroll snaps to each project. Mobile: a plain stacked list. */
    const wstory = document.querySelector<HTMLElement>(".wstory");
    const witems = gsap.utils.toArray<HTMLElement>(".wstory__item");
    if (wstory && witems.length) {
      gsap.matchMedia().add(
        { desk: "(min-width: 901px)", mob: "(max-width: 900px)" },
        (mctx) => {
          const infos = witems.map((it) => gsap.utils.toArray<HTMLElement>(".wstory__info > *", it));
          const medias = witems.map((it) => it.querySelector<HTMLElement>(".wstory__media")!);

          if (!mctx.conditions?.desk) {
            witems.forEach((item, i) =>
              gsap.from(infos[i]!, {
                y: 36,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                stagger: 0.08,
                scrollTrigger: { trigger: item, start: "top 72%" },
              }),
            );
            return;
          }

          const idx = gsap.utils.toArray<HTMLElement>(".wstory__idx");
          const last = witems.length - 1;
          let current = 0;
          const setCurrent = (n: number) => {
            if (n === current) return;
            current = n;
            idx.forEach((el, j) => el.classList.toggle("is-active", j === n));
            witems.forEach((el, j) => el.classList.toggle("is-current", j === n));
          };

          wstory.classList.add("is-pinned");
          witems.forEach((_, i) => {
            if (!i) return;
            gsap.set(infos[i]!, { y: 56, opacity: 0 });
            gsap.set(medias[i]!, { y: 70, opacity: 0, scale: 0.97 });
          });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: wstory,
              start: "top top",
              end: () => `+=${last * window.innerHeight}`,
              pin: true,
              scrub: 0.8,
              snap: { snapTo: "labels", duration: { min: 0.3, max: 0.8 }, ease: "power2.inOut" },
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                wstory.style.setProperty("--p", self.progress.toFixed(3));
                setCurrent(Math.round(self.progress * last));
              },
            },
          });
          tl.addLabel("p0", 0);
          for (let i = 1; i <= last; i++) {
            const s = i - 1;
            // strictly one after the other: the current project leaves completely
            // (by 0.4) before the next one starts arriving (from 0.5), so two
            // covers are never on screen together
            tl.to(infos[s]!, { y: -48, opacity: 0, duration: 0.35, stagger: 0.03, ease: "power2.in" }, s)
              .to(medias[s]!, { y: -70, opacity: 0, scale: 0.97, duration: 0.4, ease: "power2.in" }, s)
              .to(medias[i]!, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }, s + 0.5)
              .to(infos[i]!, { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" }, s + 0.52)
              .addLabel(`p${i}`, i);
          }

          return () => {
            wstory.classList.remove("is-pinned");
            wstory.style.removeProperty("--p");
          };
        },
      );
    }

    /* Contact: the email rises in under the title */
    gsap.from(".contact__mail, .contact__links", {
      y: 40,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".contact__title", start: "top 65%" },
    });
  };

  useEntrance({ intro, scroll, loader: true });
  return null;
}
