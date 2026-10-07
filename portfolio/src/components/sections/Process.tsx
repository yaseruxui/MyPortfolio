import { useTranslations } from "next-intl";
import { SplitText } from "@/components/ui/SplitText";

interface Step {
  t: string;
  d: string;
  tags: string[];
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];

  return (
    <section className="process" id="process">
      <div className="process__head">
        <span className="label mono">{t("label")}</span>
        <h2 className="section-title">
          <SplitText className="js-split" text={t("t1")} />{" "}
          <SplitText as="em" className="serif neon js-split" text={t("t2")} />
        </h2>
      </div>
      <div className="stack js-stack">
        <span className="ptl__track" />
        <span className="ptl__fill" />
        {steps.map((s, i) => (
          <article className="pstep" key={i}>
            <span className="pstep__dot" />
            <span className="pstep__num">{pad(i + 1)}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
            <ul className="pstep__tags mono">
              {s.tags.map((tag, j) => (
                <li key={j}>{tag}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
