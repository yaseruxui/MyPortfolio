import { useTranslations } from "next-intl";
import { WorkStory } from "@/features/work/WorkStory";
import { SplitText } from "@/components/ui/SplitText";
import { TransitionLink } from "@/components/ui/TransitionLink";

export function Work() {
  const t = useTranslations("work");

  return (
    <section className="work" id="work">
      <div className="work__head">
        <div>
          <span className="label mono">{t("label")}</span>
          <h2 className="section-title">
            <SplitText className="js-split" text={t("t1")} />{" "}
            <SplitText as="em" className="serif neon js-split" text={t("t2")} />
          </h2>
        </div>
      </div>

      <WorkStory />

      <div className="work__cta">
        <TransitionLink href="/work" className="btn magnetic">
          <span>{t("viewAll")}</span> <i aria-hidden="true">→</i>
        </TransitionLink>
      </div>
    </section>
  );
}
