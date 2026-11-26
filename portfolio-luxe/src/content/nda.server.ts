/**
 * SERVER ONLY — never import this from a client component.
 *
 * Real links and image files for NDA projects. Keeping them here (instead of
 * projects.json, which ships to the browser) is what actually protects them:
 * nothing in this file reaches the client bundle, it is only read by the
 * /api/nda route handlers after the password cookie has been verified.
 *
 * `file` is a name inside `private/work/nda/` — that folder sits OUTSIDE
 * /public, so the originals are never served as static files.
 */
export interface NdaItem {
  /** the private link revealed after unlocking (Figma, live site, drive…) */
  link: string;
  /** file name inside private/work/nda/ */
  file: string;
}

export const NDA_CONTENT: Record<string, NdaItem> = {
  "nda-fintech-app": {
    link: "https://www.figma.com/replace-me",
    file: "nda-fintech-app.webp",
  },
};
