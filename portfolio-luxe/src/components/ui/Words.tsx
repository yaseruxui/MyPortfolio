import { Fragment, type ElementType, type HTMLAttributes } from "react";

/** Tatweel (ـ) was a flourish of the old display face; this serif sets its own rhythm. */
export const clean = (s: string) => s.replace(/ـ/g, "");

const split = (text: string) => clean(text).split(/\s+/).filter(Boolean);

/**
 * Splits text into masked words for the "lines" reveal. Words — never letters —
 * so Arabic keeps its joining. Pair with data-reveal="lines" on a parent.
 * The space sits between the masks: inside an inline-block it would collapse.
 */
export function Words({
  text,
  as: Tag = "span",
  className,
  ...rest
}: { text: string; as?: ElementType } & HTMLAttributes<HTMLElement>) {
  const words = split(text);
  return (
    <Tag className={className} {...rest}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="w">
            <span>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Words that brighten as they are read (data-reveal="read"). */
export function ReadWords({ text }: { text: string }) {
  return (
    <>
      {split(text).map((w, i) => (
        <span className="rw" key={i}>
          {w}{" "}
        </span>
      ))}
    </>
  );
}
