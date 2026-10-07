"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useLocale } from "next-intl";
import { useMotion } from "@/components/fx/MotionProvider";
import { localizeHref } from "@/i18n/localize";

interface TransitionLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
}

/**
 * Internal link that plays the curtain transition before navigating
 * (replacement for the global click handler in core.js initLinks()).
 * Locale prefixing is handled by MotionProvider's next-intl router.
 */
export function TransitionLink({
  href,
  children,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = useMotion();
  const locale = useLocale();

  return (
    <a
      href={localizeHref(href, locale)}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          rest.target === "_blank"
        )
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
