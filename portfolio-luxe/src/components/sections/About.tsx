import { useMessages, useTranslations } from "next-intl";
import { SectionHead } from "@/components/ui/SectionHead";

interface Metric {
  value: string;
  affix: string;
  label: string;
}

/** "<b>6 <i>years</i></b> designing…" → words, flagged when inside <b>. */
function toWords(html: string): Array<{ w: string; em: boolean }> {
  const out: Array<{ w: string; em: boolean }> = [];
  let em = 0;
  for (const part of html.split(/(<\/?[a-z]+[^>]*>)/i)) {
    const tag = part.match(/^<(\/?)([a-z]+)/i);
    if (tag) {
      if (tag[2]?.toLowerCase() === "b") em += tag[1] ? -1 : 1;
      // a closing tag between two words stands in for the missing space
      out.push({ w: "", em: false });
      continue;
    }
    for (const w of part.split(/\s+/)) if (w) out.push({ w, em: em > 0 });
  }
  return out.filter((x) => x.w);
}

export function About() {
  const t = useTranslations("about");
  const metrics = (useMessages() as { about: { metrics: Metric[] } }).about.metrics;

  return (
    <section className="about sec" id="about">
      <SectionHead n="01" label={t("label")} />
      <p className="about__text" data-reveal="read">
        {toWords(t.raw("text") as string).map((x, i) => (
          <span key={i} className={x.em ? "rw is-em" : "rw"}>
            {x.w}{" "}
          </span>
        ))}
      </p>

      <dl className="about__metrics">
        {metrics.map((m, i) => (
          <div className="metric" key={i} data-reveal="fade" data-delay={String(i * 0.08)}>
            <dt className="metric__label">{m.label}</dt>
            <dd className="metric__num" dir="ltr">
              {/^\d+$/.test(m.value) ? <span data-count={m.value}>{m.value}</span> : m.value}
              {m.affix && <i>{m.affix}</i>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
