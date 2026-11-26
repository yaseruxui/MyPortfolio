"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PROJECTS, projectCategory } from "@/content/projects";
import type { Locale, Project } from "@/types/content";
import { img } from "@/utils/img";
import { gsap } from "@/lib/gsap";
import { hasFinePointer } from "@/lib/env";
import { TLink } from "@/components/ui/TLink";
import type { ReactNode } from "react";
import { LockIcon, NdaModal, useNdaAccess, useNdaReveal, type NdaAccess } from "./NdaGate";

const pad = (n: number) => String(n).padStart(2, "0");

/** Every project as one hairline row; on desktop a preview floats with the pointer. */
export function WorkIndex() {
  const locale = useLocale() as Locale;
  const t = useTranslations("work");
  const tLuxe = useTranslations("luxe");
  const tCursor = useTranslations("cursor");
  const access = useNdaAccess();
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Project | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || !hasFinePointer()) return;
    const x = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const row = (p: Project, i: number) => {
    const inner = (
      <>
        <span className="ix__n" dir="ltr">
          {pad(i + 1)}
        </span>
        <span className="ix__title" dir="ltr">
          <span>{p.title}</span>
        </span>
        <span className="ix__cat">{projectCategory(p, locale, t(`type.${p.type}`))}</span>
        <span className="ix__year" dir="ltr">
          {p.nda ? <LockIcon className="ix__lock" /> : p.year}
        </span>
        <span className="ix__arrow btn__arrow" aria-hidden="true" />
      </>
    );
    const common = {
      className: `ix__row${p.nda ? " is-nda" : ""}`,
      onPointerEnter: () => setHover(p),
      onPointerLeave: () => setHover(null),
    };
    return (
      <li key={p.slug} data-reveal="fade" data-delay={String(Math.min(i, 6) * 0.04)}>
        {p.nda ? (
          <NdaRow project={p} access={access} label={t("nda")} {...common}>
            {inner}
          </NdaRow>
        ) : (
          <TLink href={`/work/${p.slug}`} {...common} data-cursor={tCursor("view")}>
            {inner}
          </TLink>
        )}
      </li>
    );
  };

  return (
    <div className="ix">
      <div className="ix__head">
        <span className="eyebrow">{tLuxe("index")}</span>
        <span className="eyebrow" dir="ltr">
          ({pad(PROJECTS.length)})
        </span>
      </div>
      <ul className="ix__list" onPointerLeave={() => setHover(null)}>
        {PROJECTS.map(row)}
      </ul>

      <div className={`ix__float${hover ? " is-on" : ""}`} ref={box} aria-hidden="true">
        <div className="ix__float-in">
          {PROJECTS.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.slug}
              src={img(p.images.thumb ?? p.images.cover, 900)}
              alt=""
              loading="lazy"
              className={hover?.slug === p.slug ? "is-on" : undefined}
            />
          ))}
        </div>
      </div>

      <NdaModal access={access} />
    </div>
  );
}

/** Locked: opens the password dialog. Unlocked: goes straight to the private link. */
function NdaRow({
  project,
  access,
  label,
  children,
  ...rest
}: {
  project: Project;
  access: NdaAccess;
  label: string;
  children: ReactNode;
  className: string;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const revealed = useNdaReveal(project.slug, access.unlocked);
  if (revealed) {
    return (
      <a href={revealed.link} target="_blank" rel="noopener" {...rest} data-cursor="↗">
        {children}
      </a>
    );
  }
  return (
    <button type="button" {...rest} onClick={() => access.open(project)} data-cursor={label}>
      {children}
    </button>
  );
}
