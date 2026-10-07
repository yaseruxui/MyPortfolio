"use client";

import { useEffect, useRef, useState } from "react";

/** The email as the section's hero element, plus a one-click copy button. */
export function ContactMail({
  email,
  labels,
}: {
  email: string;
  labels: { hi: string; copy: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch {
      // Clipboard API blocked (permissions policy, embedded view, old browser):
      // fall back to a temporary selection + execCommand("copy").
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
    }
    if (!ok) return; // the mailto link still works
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cmail">
      <a href={`mailto:${email}`} className="cmail__link" dir="ltr" data-cursor-label={labels.hi}>
        {email}
      </a>
      <button
        type="button"
        className={`cmail__copy${copied ? " is-done" : ""}`}
        onClick={copy}
        aria-live="polite"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9" />
          </svg>
        )}
        <span>{copied ? labels.copied : labels.copy}</span>
      </button>
    </div>
  );
}
