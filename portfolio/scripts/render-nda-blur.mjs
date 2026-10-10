// Bakes the public, blurred cover for every NDA project.
//
// Reads the originals from  private/work/nda/<file>       (never served)
// Writes the blurred copy to public/images/work/covers/nda/<file>
//
// The blur is destructive on purpose: it is downscaled first, so the public
// file physically cannot be sharpened back. A CSS blur would not protect
// anything — the browser would still download the original.
//
// Run: node scripts/render-nda-blur.mjs [file ...]   (no args = all)
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "private/work/nda";
const OUT = "public/images/work/covers/nda";

await mkdir(OUT, { recursive: true });

const all = (await readdir(SRC).catch(() => [])).filter((f) =>
  /\.(webp|jpe?g|png)$/i.test(f),
);
const files = process.argv.length > 2 ? process.argv.slice(2) : all;

if (!files.length) {
  console.log(`No images in ${SRC}/ — drop the NDA originals there and re-run.`);
}

for (const file of files) {
  const out = path.join(OUT, `${path.parse(file).name}.webp`);
  await sharp(path.join(SRC, file))
    // shrink to throw the detail away, blur, then scale back up
    .resize(40, 25, { fit: "cover" })
    .blur(6)
    .resize(1600, 1000, { fit: "cover" })
    .modulate({ brightness: 0.8 })
    .webp({ quality: 70 })
    .toFile(out);
  console.log(`blurred → ${out}`);
}
