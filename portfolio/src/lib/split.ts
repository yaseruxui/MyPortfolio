/* =========================================================
   Text splitting — ported verbatim from the original core.js.
   Arabic splits by WORD so letters stay joined; Latin splits by
   char. <b>/<strong> => highlight (hl), <i>/<em> => kashida (kx).
   ========================================================= */

const AR = /[؀-ۿ]/;

const makeSpan = (cls: string, text: string): HTMLSpanElement => {
  const s = document.createElement("span");
  s.className = cls;
  s.textContent = text;
  return s;
};

export function splitChars(el: Element, isRtl: boolean): NodeListOf<Element> {
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const txt = child.textContent ?? "";
        if (!txt.trim()) return;
        const frag = document.createDocumentFragment();
        if (AR.test(txt)) {
          txt.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            frag.append(
              /^\s+$/.test(part)
                ? document.createTextNode(" ")
                : makeSpan("char", part),
            );
          });
        } else {
          // Latin inside an RTL page: isolate so letters keep LTR order
          const box: DocumentFragment | HTMLSpanElement = isRtl
            ? document.createElement("span")
            : frag;
          if (isRtl && box instanceof HTMLSpanElement) box.dir = "ltr";
          // a plain space collapses to zero width inside an inline-block
          // .char span, gluing the words together — use a no-break space
          [...txt].forEach((c) =>
            box.append(makeSpan("char", c === " " ? " " : c)),
          );
          if (isRtl) frag.append(box);
        }
        (child as ChildNode).replaceWith(frag);
      } else if (
        child.nodeType === 1 &&
        !(child as Element).classList.contains("char")
      ) {
        walk(child);
      }
    });
  };
  walk(el);
  return el.querySelectorAll(".char");
}

function wordsHTML(text: string, classes: string[], isRtl: boolean): string {
  const cls = ["wd", ...classes].join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean);
  let out = "";
  let latinRun: string[] = [];
  const flush = () => {
    if (!latinRun.length) return;
    out += `<span dir="ltr">${latinRun
      .map((w) => `<span class="${cls}">${w}</span>`)
      .join(" ")}</span> `;
    latinRun = [];
  };
  words.forEach((w) => {
    if (isRtl && !AR.test(w)) {
      latinRun.push(w);
      return;
    }
    flush();
    out += `<span class="${cls}">${w}</span> `;
  });
  flush();
  return out;
}

function walkSplit(node: Node, classes: string[], isRtl: boolean): string {
  let out = "";
  node.childNodes.forEach((ch) => {
    if (ch.nodeType === 3) out += wordsHTML(ch.textContent ?? "", classes, isRtl);
    else if (ch.nodeType === 1) {
      const tag = (ch as Element).tagName.toLowerCase();
      const next = [...classes];
      if (tag === "b" || tag === "strong") next.push("hl");
      if (tag === "i" || tag === "em") next.push("kx");
      out += walkSplit(ch, next, isRtl);
    }
  });
  return out;
}

export function splitWords(el: Element, isRtl: boolean): NodeListOf<Element> {
  el.innerHTML = walkSplit(el, [], isRtl).trim();
  return el.querySelectorAll(".wd");
}
