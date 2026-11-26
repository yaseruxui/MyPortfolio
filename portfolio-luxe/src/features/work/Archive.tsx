"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ScrollTrigger } from "@/lib/gsap";
import { PROJECTS, projectCategory, projectSummary } from "@/content/projects";
import type { Locale, Project, ProjectType } from "@/types/content";
import { img } from "@/utils/img";
import { TLink } from "@/components/ui/TLink";
import { LockIcon, NdaCountdown, NdaModal, useNdaAccess, useNdaReveal, type NdaAccess } from "./NdaGate";

type Filter = "all" | ProjectType;
const FILTERS: Filter[] = ["all", "app", "web", "brand"];
const pad = (n: number) => String(n).padStart(2, "0");

export function Archive() {
  const locale = useLocale() as Locale;
  const t = useTranslations("work");
  const tCursor = useTranslations("cursor");
  const access = useNdaAccess();
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(
    () => (filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.type === filter)),
    [filter],
  );
  const count = (f: Filter) => (f === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.type === f).length);

  // the grid height changes with the filter; let pinned/scrubbed triggers re-measure
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => window.clearTimeout(id);
  }, [filter]);

  return (
    <>
      <div className="tabs" role="tablist" aria-label={t("allLabel")}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`tab${filter === f ? " is-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {t(`tabs.${f}`)}
            <sup dir="ltr">{pad(count(f))}</sup>
          </button>
        ))}
        {access.expiresAt && (
          <span style={{ marginInlineStart: "auto", alignSelf: "center" }}>
            <NdaCountdown expiresAt={access.expiresAt} />
          </span>
        )}
      </div>

      <div className="grid">
        {list.map((p, i) => {
          const info = (
            <div className="card__info">
              <span className="card__n" dir="ltr">
                {pad(i + 1)}
              </span>
              <span className="card__title" dir="ltr">
                {p.title}
              </span>
              <span className="card__meta">
                {projectCategory(p, locale, t(`type.${p.type}`))} · <bdi>{p.year}</bdi>
              </span>
              <p className="card__sum">{projectSummary(p, locale)}</p>
            </div>
          );
          return p.nda ? (
            <NdaCard key={p.slug} project={p} access={access} info={info} />
          ) : (
            <TLink key={p.slug} href={`/work/${p.slug}`} className="card" data-cursor={tCursor("view")}>
              <div className="card__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(p.images.thumb ?? p.images.cover)} alt={p.title} loading={i < 2 ? "eager" : "lazy"} />
              </div>
              {info}
            </TLink>
          );
        })}
      </div>

      <NdaModal access={access} />
    </>
  );
}

function NdaCard({ project: p, access, info }: { project: Project; access: NdaAccess; info: React.ReactNode }) {
  const t = useTranslations("work");
  const revealed = useNdaReveal(p.slug, access.unlocked);
  const media = (
    <div className="card__media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={revealed ? revealed.image : img(p.images.cover)} alt={revealed ? p.title : ""} loading="lazy" />
      {!revealed && (
        <span className="card__lock">
          <LockIcon />
          <b>{t("nda")}</b>
          <span>{t("ndaUnlockCta")}</span>
        </span>
      )}
    </div>
  );
  return revealed ? (
    <a className="card" href={revealed.link} target="_blank" rel="noopener" data-cursor="↗">
      {media}
      {info}
    </a>
  ) : (
    <button type="button" className="card" onClick={() => access.open(p)} data-cursor={t("nda")}>
      {media}
      {info}
    </button>
  );
}
