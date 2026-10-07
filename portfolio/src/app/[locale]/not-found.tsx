import { useTranslations } from "next-intl";
import { TransitionLink } from "@/components/ui/TransitionLink";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <main className="nf">
      <span className="nf__code" aria-hidden="true">
        404
      </span>
      <h1 className="nf__title">{t("title")}</h1>
      <p className="nf__text">{t("text")}</p>
      <TransitionLink href="/" className="btn btn--solid magnetic">
        <span>{t("back")}</span>
      </TransitionLink>
    </main>
  );
}
