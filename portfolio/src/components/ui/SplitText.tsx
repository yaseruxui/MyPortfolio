import type { CSSProperties } from "react";

/**
 * Renders text whose DOM will be mutated imperatively by splitChars/splitWords
 * (GSAP reveals). Using dangerouslySetInnerHTML makes React treat the node's
 * contents as externally managed, so it never tries to reconcile the injected
 * .char/.wd spans — avoiding "insertBefore" reconciliation crashes.
 */
export function SplitText({
  text,
  className,
  dir,
  style,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  dir?: "ltr" | "rtl";
  style?: CSSProperties;
  as?: "span" | "em";
}) {
  return (
    <Tag
      className={className}
      dir={dir}
      style={style}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}
