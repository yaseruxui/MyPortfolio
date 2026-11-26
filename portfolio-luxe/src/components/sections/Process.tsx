import { useMessages, useTranslations } from "next-intl";
import { Words } from "@/components/ui/Words";
import { SectionHead } from "@/components/ui/SectionHead";

interface Step {
  t: string;
  d: string;
  tags: string[];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export function Process() {
  const t = useTranslations("process");
  const steps = (useMessages() as { process: { steps: Step[] } }).process.steps;

  return (
    <section className="proc sec" id="process">
      <SectionHead n="03" label={t("label")} />
      <div className="proc__grid">
        <h2 className="proc__title display" data-reveal="lines">
          <Words text={t("t1")} /> <Words as="em" text={t("t2")} />
        </h2>
        <ol className="proc__steps">
          {steps.map((s, i) => (
            <li className="step" key={i} data-reveal="fade">
              <span className="step__n" dir="ltr">
                {ROMAN[i]}
              </span>
              <div className="step__body">
                <h3 className="step__t">{s.t}</h3>
                <p className="step__d">{s.d}</p>
                <p className="step__tags">{s.tags.join("  ·  ")}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
