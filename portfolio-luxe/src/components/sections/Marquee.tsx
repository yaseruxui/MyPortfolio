import { useMessages, useTranslations } from "next-intl";

export function Marquee() {
  const t = useTranslations();
  const items = (useMessages() as { marquee: string[] }).marquee;
  const row = [...items, t("marqueeHighlight")];

  const strip = (hidden: boolean) => (
    <div className="mq__strip" aria-hidden={hidden || undefined}>
      {row.map((w, i) => (
        <span key={i} className={i === row.length - 1 ? "mq__w is-hl" : "mq__w"}>
          {w}
          <i aria-hidden="true">✦</i>
        </span>
      ))}
    </div>
  );

  return (
    <div className="mq" role="marquee">
      <div className="mq__track">
        {strip(false)}
        {strip(true)}
      </div>
    </div>
  );
}
