// Region preview with a coordinate grid (labels in source px), for picking crops.
// node scripts/covers/ruler.mjs <src.png> <left> <top> <width> <height> [scale] [step]
import sharp from "sharp";

const [src, l, t, w, h, scale = "0.3", step = "200"] = process.argv.slice(2);
const L = +l, T = +t, W = +w, H = +h, S = +scale, ST = +step;
const img = await sharp(src).extract({ left: L, top: T, width: W, height: H }).resize({ width: Math.round(W * S) }).png().toBuffer();
const ow = Math.round(W * S), oh = Math.round(H * S);
let lines = "";
for (let x = Math.ceil(L / ST) * ST; x < L + W; x += ST) {
  const px = (x - L) * S;
  lines += `<line x1="${px}" y1="0" x2="${px}" y2="${oh}" stroke="#f0f" stroke-width="1" opacity=".55"/><text x="${px + 2}" y="12" font-size="11" fill="#f0f" font-family="Arial">${x}</text>`;
}
for (let y = Math.ceil(T / ST) * ST; y < T + H; y += ST) {
  const py = (y - T) * S;
  lines += `<line x1="0" y1="${py}" x2="${ow}" y2="${py}" stroke="#0aa" stroke-width="1" opacity=".55"/><text x="2" y="${py - 2}" font-size="11" fill="#0aa" font-family="Arial">${y}</text>`;
}
await sharp(img).composite([{ input: Buffer.from(`<svg width="${ow}" height="${oh}">${lines}</svg>`) }]).toFile("inspiration/ruler.png");
console.log("ruler", ow, oh);
