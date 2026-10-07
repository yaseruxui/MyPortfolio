/**
 * First-visit logo preloader: "<YASER ABU MUSTAFA />" types itself out like
 * code, then the tag and everything but the initials fold away so the mark
 * settles into "YA." (Y from Yaser, A from Abu) and flies into the nav logo.
 * Rendered only on the home page. The entrance sequence animates and then
 * removes the `.loader` node imperatively; to keep that safe we hand React an
 * opaque wrapper (dangerouslySetInnerHTML) so it never reconciles the inner node.
 */
const esc = (c: string) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : c);
const letter = (c: string, kept = false) =>
  `<span class="lm-m${kept ? " lm-k" : ""}"><span class="lm-l">${esc(c)}</span></span>`;
const letters = (s: string) =>
  [...s].map((c) => (c === " " ? `<span class="lm-sp"></span>` : letter(c))).join("");
/** a run of letters that folds away, leaving the initials */
const fold = (s: string, cls = "") => `<span class="lm-c${cls}">${letters(s)}</span>`;

export function Loader() {
  const html = `
    <div class="loader" aria-hidden="true">
      <div class="loader__bg"></div>
      <div class="loader__mark" dir="ltr">${fold("<", " lm-code")}${letter("Y", true)}${fold("ASER ")}${letter("A", true)}${fold("BU MUSTAFA")}${fold(" />", " lm-code")}<i class="lm-dot"></i><i class="lm-caret"></i></div>
    </div>`;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
