// Downloads the full-size project images from Yaser's Behance case studies
// (source material for the showcase covers) into scripts/covers/source/<slug>/.
// Image lists were read from the rendered project pages; Behance blocks plain
// page requests but serves the images from its CDN.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const CDN = "https://mir-s3-cdn-cf.behance.net/project_modules/";
const SOURCES = {
  meetx: ["max_3840_webp/93a246128451903.61579ede3f86b.jpg", "max_3840_webp/06b4f2128451903.615859286962b.jpg", "max_3840_webp/9d7b5c128451903.61579ede3e816.jpg", "max_3840_webp/2ad39b128451903.61579ede3fe3c.jpg", "max_3840_webp/20416e128451903.61579ede3f125.jpg", "max_3840_webp/2159d8128451903.61579ede3c099.jpg", "max_3840_webp/6d7417128451903.61579ede4308f.jpg", "max_3840_webp/8341f2128451903.61579ede41567.jpg", "max_3840_webp/fb52fd128451903.61579ede40738.jpg", "max_3840_webp/50f034128451903.61579ede42340.jpg", "max_3840_webp/0eb34a128451903.61579ede3e1da.jpg", "max_3840_webp/fbdc30128451903.61579ede3ce98.jpg", "max_3840_webp/66a687128451903.61579ede3d76e.jpg", "max_3840_webp/ccb7a0128451903.61579ede41dfd.jpg"],
  cuare: ["1400_webp/55202f125629789.61a215ab3f835.jpg", "max_3840_webp/af1fe8125629789.611d496070fc7.png", "max_3840_webp/fdbd83125629789.611d4960708a3.png", "1400_webp/906299125629789.61226032c72bb.png", "max_3840_webp/59f51e125629789.611d496071dfd.png", "max_3840_webp/7f033e125629789.611d49606f97e.png", "max_3840_webp/0c099b125629789.611d4a3a1a824.png", "max_3840_webp/f82a1d125629789.611d4960700ad.png", "max_3840_webp/a916a5125629789.611d49607179d.png", "max_3840_webp/3b7630125629789.611d49606f1df.png"],
  "1min-job-finder": ["max_3840_webp/295d19143023529.6272918ee813c.jpg", "max_3840_webp/cc3841143023529.6272918ee732f.jpg", "max_3840_webp/1d5409143023529.6272918ee5642.jpg", "max_3840_webp/6390e7143023529.6272918ee98c8.jpg", "max_3840_webp/23a1e2143023529.6272918ee5e04.jpg", "max_3840_webp/8d239d143023529.6272918ee6bfa.jpg", "max_3840_webp/d64ed9143023529.6272918eea005.jpg", "max_3840_webp/bdfac1143023529.6272a51018503.jpg", "max_3840_webp/fd3509143023529.6272918ee9101.jpg", "max_3840_webp/7d4772143023529.6272a1acdc7d0.jpg", "max_3840_webp/689b7f143023529.6272a1acdbdd4.jpg"],
  "ayam-store": ["max_3840_webp/3ac715129732471.6171230e4eb61.jpg", "max_3840_webp/c4f25c129732471.6171230e509ea.jpg", "max_3840_webp/49e3e7129732471.6171230e5020f.jpg", "max_3840_webp/de09b5129732471.6171230e4fc13.jpg", "max_3840_webp/59a736129732471.6171230e4f3ab.jpg"],
  "viola-landing": ["max_3840_webp/5430e4127988644.614cc983bc292.jpg"],
  "brand-guideline-alshams": ["1400_webp/beb4e4120000713.60a90249cac62.jpg"],
  "yaser-ahmed-identity": ["1400_webp/765673107255171.5fa2d0838d4c4.jpg", "1400_webp/04dbc9107255171.5fa3152cb9586.jpg", "1400_webp/02488c107255171.5fa2d083879e7.jpg", "1400_webp/b23b87107255171.5fa2d08389ae6.jpg", "1400_webp/c32586107255171.5fa311ce27eb7.jpg", "1400_webp/2153f7107255171.5fa2d08388aba.jpg", "1400_webp/dfb4e3107255171.5fa2d0838aa43.jpg", "max_3840_webp/9853b6107255171.5fa311ce2884a.jpg", "1400_webp/297967107255171.5fa2d0838e859.jpg", "1400_webp/97e0aa107255171.5fa2d0838b08d.jpg", "max_3840_webp/e13075107255171.5fa462ea09470.jpg", "max_3840_webp/2226db107255171.5fa45fd128bed.jpg", "1400_webp/b19078107255171.5fa2d0838cd0f.jpg", "1400_webp/afc9de107255171.5fa2d0838815b.jpg", "1400_webp/772f25107255171.5fa2d0838ba20.jpg", "1400_webp/2032b7107255171.5fa2d08389350.jpg"],
  "logos-collection": ["max_3840_webp/8a8595125410789.61192980dfd9b.jpg", "max_3840_webp/9760db125410789.61190626c935e.jpg", "max_3840_webp/6b3f1f125410789.61190ae4cf28b.jpg", "max_3840_webp/6bbc91125410789.611a107f6c180.jpg"],
  "social-media-vol1": ["max_3840_webp/0e5ffe112458823.60a139e3592b0.jpg"],
};

for (const [slug, list] of Object.entries(SOURCES)) {
  const dir = `scripts/covers/source/${slug}/`;
  await mkdir(dir, { recursive: true });
  let i = 0;
  for (const path of list) {
    const res = await fetch(CDN + path, { headers: { "user-agent": "Mozilla/5.0", referer: "https://www.behance.net/" } });
    if (!res.ok) {
      console.log("✗", slug, path, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const file = `${dir}${String(++i).padStart(2, "0")}.png`;
    // store as lossless PNG so later crops don't stack compression
    await sharp(buf).png().toFile(file);
    const m = await sharp(file).metadata();
    console.log("✓", slug, file.split("/").pop(), `${m.width}x${m.height}`);
  }
}
