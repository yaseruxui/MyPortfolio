// Preview sheet of a project's source images: node scripts/covers/contact-sheet.mjs <slug> [colWidth]
import sharp from "sharp";
import { readdir } from "node:fs/promises";

const [slug, colW = "260"] = process.argv.slice(2);
const dir = `scripts/covers/source/${slug}/`;
const files = (await readdir(dir)).filter((f) => f.endsWith(".png")).sort();
const W = +colW;
const tiles = [];
for (const f of files) {
  const buf = await sharp(dir + f).resize({ width: W }).png().toBuffer({ resolveWithObject: true });
  tiles.push({ f, ...buf });
}
const H = Math.max(...tiles.map((t) => t.info.height)) + 30;
const comp = [];
tiles.forEach((t, i) => {
  comp.push({ input: t.data, left: i * (W + 12), top: 30 });
  comp.push({ input: Buffer.from(`<svg width="${W}" height="26"><text x="4" y="20" font-size="18" fill="#fff" font-family="Arial">${t.f}</text></svg>`), left: i * (W + 12), top: 0 });
});
await sharp({ create: { width: tiles.length * (W + 12), height: Math.min(H, 4000), channels: 3, background: "#333" } })
  .composite(comp.map((c) => ({ ...c })))
  .png()
  .toFile(`inspiration/sheet-${slug}.png`);
console.log("sheet", slug, files.length);
