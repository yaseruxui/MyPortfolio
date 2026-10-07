import { Fragment } from "react";
import { useTranslations } from "next-intl";

export function Marquee() {
  const t = useTranslations();
  const items = t.raw("marquee") as string[];

  // The highlighted item closes each row in the accent color. Keeping it out of
  // the plain/serif alternation means no two same-style items ever touch, even
  // where one row loops into the next.
  const row = (
    <div className="marquee__row js-marquee">
      {items.map((w, i) => (
        <Fragment key={i}>
          <span className={i % 2 ? "serif" : undefined}>{w}</span>
          <i>✦</i>
        </Fragment>
      ))}
      <span className="marquee__hl">{t("marqueeHighlight")}</span>
      <i>✦</i>
    </div>
  );

  // 4 rows rendered up-front (the original cloned the row ×3 at runtime) so the
  // seamless loop works without mutating the DOM imperatively under React.
  return (
    <section className="marquee" aria-label="Skills">
      <div className="marquee__track">
        {[0, 1, 2, 3].map((n) => (
          <Fragment key={n}>{row}</Fragment>
        ))}
      </div>
    </section>
  );
}
