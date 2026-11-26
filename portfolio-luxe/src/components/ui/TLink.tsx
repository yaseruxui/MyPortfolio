"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useLocale } from "next-intl";
import { localizeHref } from "@/i18n/localize";
import { useLuxe } from "@/components/motion/LuxeProvider";

/** Internal link that plays the curtain before navigating. */
export function TLink({
  href,
  children,
  onClick,
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
}) {
  const { navigate } = useLuxe();
  const locale = useLocale();
  return (
    <a
      href={localizeHref(href, locale)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || rest.target === "_blank")
          return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
