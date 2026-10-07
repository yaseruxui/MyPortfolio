import type { CSSProperties } from "react";
import { TOOL_PATHS } from "@/content/tool-icons";

/* Adobe app marks follow Adobe's own icon format: a rounded square with the
   two-letter app code, in the app's colour. */
const ADOBE: Record<string, { code: string; hex: string }> = {
  "Adobe XD": { code: "Xd", hex: "#FF61F6" },
  Illustrator: { code: "Ai", hex: "#FF9A00" },
};

/**
 * Monochrome brand mark for a tool (uses currentColor). The brand colour is
 * exposed as --brand so CSS can tint it on hover. Unknown names render nothing.
 */
export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const brand = TOOL_PATHS[name];
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" className={className} style={{ "--brand": brand.hex } as CSSProperties} aria-hidden="true">
        <path d={brand.path} fill="currentColor" />
      </svg>
    );
  }
  const adobe = ADOBE[name];
  if (adobe) {
    return (
      <svg viewBox="0 0 24 24" className={className} style={{ "--brand": adobe.hex } as CSSProperties} aria-hidden="true">
        <rect x="1.2" y="1.2" width="21.6" height="21.6" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <text
          x="12"
          y="16.3"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="10.5"
          fontWeight="700"
          fill="currentColor"
        >
          {adobe.code}
        </text>
      </svg>
    );
  }
  return null;
}
