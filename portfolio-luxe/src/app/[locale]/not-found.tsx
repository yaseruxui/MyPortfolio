import { useTranslations } from "next-intl";
import { TLink } from "@/components/ui/TLink";

export default function NotFoundPage() {
  const t = useTranslations("notFound");
  return (
    <main className="nf">
      <span className="nf__code" aria-hidden="true" dir="ltr">
        404
      </span>
      <h1 className="nf__title">{t("title")}</h1>
      <p className="nf__text">{t("text")}</p>
      <TLink href="/" className="btn btn--gold">
        <span>{t("back")}</span>
        <i className="btn__arrow" aria-hidden="true" />
      </TLink>
    </main>
  );
}
