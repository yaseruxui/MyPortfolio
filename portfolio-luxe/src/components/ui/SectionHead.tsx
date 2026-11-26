import type { ReactNode } from "react";

/** "(01)  Label ———————— aside" — the hairline header every section opens with. */
export function SectionHead({ n, label, aside }: { n: string; label: string; aside?: ReactNode }) {
  return (
    <div className="shead">
      <span className="shead__n" dir="ltr">
        ({n})
      </span>
      <span className="eyebrow">{label}</span>
      <span className="shead__rule" data-reveal="rule" aria-hidden="true" />
      {aside && <span className="eyebrow shead__aside">{aside}</span>}
    </div>
  );
}
