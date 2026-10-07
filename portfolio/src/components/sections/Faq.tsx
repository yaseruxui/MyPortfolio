"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SplitText } from "@/components/ui/SplitText";

interface QA {
  q: string;
  a: string;
}

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as QA[];
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="faq" id="faq">
      <div className="faq__head">
        <span className="label mono">{t("label")}</span>
        <h2 className="section-title">
          <SplitText className="js-split" text={t("t1")} />{" "}
          <SplitText as="em" className="serif neon js-split" text={t("t2")} />
        </h2>
      </div>

      <div className="faq__list">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div className={`faq__item${isOpen ? " is-open" : ""}`} key={i}>
              <button
                className="faq__q"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="faq__n mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="faq__qt">{it.q}</span>
                <span className="faq__icon" aria-hidden="true" />
              </button>
              <div className="faq__a" hidden={!isOpen}>
                <p>{it.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
