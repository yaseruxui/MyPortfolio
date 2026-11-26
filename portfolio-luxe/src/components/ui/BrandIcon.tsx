import { SOCIAL_PATHS } from "@/content/tool-icons";

/** Social/brand mark (Simple Icons path), filled with currentColor. */
export function BrandIcon({ name }: { name: keyof typeof SOCIAL_PATHS }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={SOCIAL_PATHS[name]!.path} />
    </svg>
  );
}
