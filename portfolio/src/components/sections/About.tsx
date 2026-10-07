import { useTranslations } from "next-intl";

interface Metric {
  value: string;
  affix: string;
  label: string;
}

export function About() {
  const t = useTranslations("about");
  const metrics = t.raw("metrics") as Metric[];

  return (
    <section className="about" id="about">
      <div className="about__pin">
        <span className="label mono">{t("label")}</span>
        <p
          className="about__text js-reveal-words"
          dangerouslySetInnerHTML={{ __html: t.raw("text") as string }}
        />
        <div className="about__stats js-stats">
          {metrics.map((m, i) => (
            <div key={i}>
              <strong>
                <span className="stat__val" dir="ltr">
                  {/* real value in the HTML; HomeMotion resets it to 0 and counts up */}
                  <span className="js-num" data-to={m.value}>
                    {m.value}
                  </span>
                  {m.affix && <em className="stat__affix">{m.affix}</em>}
                </span>
              </strong>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
