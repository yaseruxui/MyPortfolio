"use client";

import { useState } from "react";
import { useMessages, useTranslations } from "next-intl";
import { SectionHead } from "@/components/ui/SectionHead";
import { clean } from "@/components/ui/Words";

interface Item {
  q: string;
  a: string;
}

export function Faq({ n = "05" }: { n?: string }) {
  const t = useTranslations("faq");
  const items = (useMessages() as { faq: { items: Item[] } }).faq.items;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq sec">
      <SectionHead n={n} label={t("label")} />
      <div className="faq__grid">
        <h2 className="faq__title display" data-reveal="fade">
          {clean(t("t1"))} <em>{clean(t("t2"))}</em>
        </h2>
        <ul className="faq__list">
          {items.map((it, i) => {
            const on = open === i;
            return (
              <li key={i} className={`qa${on ? " is-open" : ""}`} data-reveal="fade" data-delay={String(i * 0.06)}>
                <button
                  type="button"
                  className="qa__q"
                  aria-expanded={on}
                  aria-controls={`qa-${i}`}
                  onClick={() => setOpen(on ? null : i)}
                >
                  <span className="qa__n" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="qa__text">{it.q}</span>
                  <span className="qa__icon" aria-hidden="true" />
                </button>
                <div className="qa__a" id={`qa-${i}`} role="region">
                  <div>
                    <p>{it.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
