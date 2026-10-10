"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SITE } from "@/content/site";
import type { Project } from "@/types/content";
import { img } from "@/utils/img";

interface Session {
  unlocked: boolean;
  expiresAt: number | null;
}

/** Shared unlock state: one password opens every NDA project. */
export function useNdaAccess() {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [openFor, setOpenFor] = useState<Project | null>(null);

  // pick up an unlock that is still running (e.g. after a page reload)
  useEffect(() => {
    let alive = true;
    fetch("/api/nda/unlock")
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Session | null) => {
        if (alive && s?.unlocked && s.expiresAt) setExpiresAt(s.expiresAt);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // re-lock the UI the moment the window closes
  useEffect(() => {
    if (expiresAt === null) return;
    const id = setInterval(() => {
      if (Date.now() >= expiresAt) setExpiresAt(null);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return {
    unlocked: expiresAt !== null,
    expiresAt,
    openFor,
    open: (p: Project) => setOpenFor(p),
    close: () => setOpenFor(null),
    onUnlocked: (exp: number) => {
      setExpiresAt(exp);
      setOpenFor(null);
    },
  };
}

export type NdaAccess = ReturnType<typeof useNdaAccess>;

/** mm:ss left on the current unlock */
export function NdaCountdown({ expiresAt }: { expiresAt: number }) {
  const t = useTranslations("work");
  const [left, setLeft] = useState(() => Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, expiresAt - Date.now())), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <span className="nda-timer mono">
      {t("ndaExpires")}{" "}
      <b dir="ltr">
        {m}:{String(s).padStart(2, "0")}
      </b>
    </span>
  );
}

/* ------------------------------- the card ------------------------------- */

export function NdaCard({
  project: p,
  category,
  info,
  access,
}: {
  project: Project;
  category: string;
  info: ReactNode;
  access: NdaAccess;
}) {
  const t = useTranslations("work");
  const [revealed, setRevealed] = useState<{ link: string; image: string } | null>(null);

  // once unlocked, pull the real cover + link for this project
  useEffect(() => {
    if (!access.unlocked) {
      setRevealed(null);
      return;
    }
    let alive = true;
    fetch(`/api/nda/${p.slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.link) setRevealed({ link: d.link, image: d.image });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [access.unlocked, p.slug]);

  const media = (
    <div className="project__media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={revealed ? revealed.image : img(p.images.cover)}
        alt={revealed ? p.title : ""}
        aria-hidden={revealed ? undefined : true}
        loading="lazy"
      />
      <span className="project__chip">{category}</span>
      {revealed ? (
        <span className="project__view mono">{t("ndaOpen")} ↗</span>
      ) : (
        <span className="project__lock">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="10" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <b>{t("nda")}</b>
          <span>{t("ndaUnlockCta")}</span>
        </span>
      )}
    </div>
  );

  if (revealed) {
    return (
      <a
        className="project project--nda is-unlocked"
        data-type={p.type}
        href={revealed.link}
        target="_blank"
        rel="noopener"
      >
        {media}
        {info}
      </a>
    );
  }

  return (
    <button type="button" className="project project--nda" data-type={p.type} onClick={() => access.open(p)}>
      {media}
      {info}
    </button>
  );
}

/* ------------------------------ the dialog ------------------------------ */

export function NdaModal({ access }: { access: NdaAccess }) {
  const t = useTranslations("work");
  const p = access.openFor;
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { close } = access;

  useEffect(() => {
    if (!p) return;
    setPassword("");
    setError(null);
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [p, close]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password || busy) return;
      setBusy(true);
      setError(null);
      try {
        const r = await fetch("/api/nda/unlock", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const d = await r.json().catch(() => null);
        if (r.ok && d?.expiresAt) access.onUnlocked(d.expiresAt);
        else setError(r.status === 429 ? t("ndaTooMany") : t("ndaWrong"));
      } catch {
        setError(t("ndaWrong"));
      } finally {
        setBusy(false);
      }
    },
    [password, busy, access, t],
  );

  if (!p) return null;

  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    t("ndaWaMsg", { title: p.title }),
  )}`;

  return (
    <div className="nda-overlay" onClick={close} role="presentation">
      <div
        className="nda-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("ndaTitle")}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="nda-dialog__x" onClick={close} aria-label={t("ndaClose")}>
          ✕
        </button>

        <svg className="nda-dialog__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="10" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>

        <h3>{t("ndaTitle")}</h3>
        <p className="nda-dialog__desc">{t("ndaDesc", { title: p.title })}</p>

        <form onSubmit={submit} className="nda-form">
          <input
            ref={inputRef}
            type="password"
            className="nda-input"
            placeholder={t("ndaPassword")}
            aria-label={t("ndaPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn btn--solid" disabled={busy || !password}>
            <span>{busy ? "…" : t("ndaSubmit")}</span>
          </button>
        </form>

        {error && (
          <p className="nda-error" role="alert">
            {error}
          </p>
        )}

        <a className="nda-wa" href={wa} target="_blank" rel="noopener">
          {t("ndaWhatsapp")} ↗
        </a>
      </div>
    </div>
  );
}
