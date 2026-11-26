import type { ReactNode } from "react";

// Root layout is intentionally a pass-through: the real <html>/<body> live in
// src/app/[locale]/layout.tsx so they can read the active locale (next-intl).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
