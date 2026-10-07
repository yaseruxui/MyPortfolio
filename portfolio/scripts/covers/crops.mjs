// Cuts the real screens out of the downloaded Behance images
// (scripts/covers/source/<slug>/) into scripts/covers/assets/<slug>/.
// Boxes are [file, left, top, width, height] in source pixels; `rotate`
// straightens a tilted mockup first. Run: node scripts/covers/crops.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const CROPS = {
  meetx: {
    // 01.png is the Behance cover at 2×; its screens are tilted 28°
    rotate: { file: "01.png", deg: 28 },
    screens: {
      onboarding: [null, 1304, 1580, 584, 1196],
      home: [null, 2006, 1120, 592, 1280],
      meeting: [null, 2000, 2514, 568, 544],
    },
    logo: ["01.png", 172, 384, 808, 216],
  },
  cuare: {
    screens: {
      signin: ["10.png", 176, 655, 688, 1526],
      profile: ["10.png", 1056, 889, 688, 1536],
      service: ["10.png", 176, 2452, 688, 1526],
      caregivers: ["10.png", 1056, 2689, 688, 1526],
      doctor: ["10.png", 1936, 2452, 688, 1526],
    },
    logo: ["01.png", 70, 168, 212, 204],
  },
  "1min-job-finder": {
    screens: {
      feed: ["10.png", 2849, 2883, 634, 1387],
      jobs: ["10.png", 2024, 4013, 634, 1387],
      details: ["10.png", 2024, 5580, 634, 1387],
      grid: ["10.png", 1199, 6017, 634, 1387],
    },
    // the 1Min mark lives on a light tile: keep the tile as-is (no transparency)
    logo: ["01.png", 322, 609, 209, 206, "raw"],
  },
  "ayam-store": {
    // 04.png: the redesigned home page on its presentation board
    screens: { page: ["04.png", 256, 560, 2288, 3000] },
    logo: ["04.png", 2226, 584, 120, 118, "raw"],
  },
  "viola-landing": {
    screens: { page: ["01.png", 190, 3060, 2418, 2600] },
    logo: ["01.png", 392, 3092, 150, 46],
  },
  "yaser-ahmed-identity": {
    screens: {
      stationery: ["07.png", 0, 0, 1400, 1069],
      cards: ["15.png", 0, 0, 1400, 1048],
      tablet: ["12.png", 0, 0, 3840, 2659],
      pattern: ["13.png", 0, 0, 1400, 1050],
    },
  },
  "logos-collection": {
    // one tile per logo from the long presentation boards
    screens: {
      l1: ["02.png", 900, 1150, 1200, 1100],
      l2: ["02.png", 900, 3714, 1200, 1100],
      l3: ["02.png", 900, 9940, 1200, 1100],
      l4: ["02.png", 900, 6196, 1200, 1100],
      l5: ["04.png", 750, 9150, 1200, 1100],
      l6: ["04.png", 750, 12000, 1200, 1100],
    },
  },
  "brand-guideline-alshams": {
    screens: {
      cover: ["01.png", 0, 0, 1400, 1000],
      open: ["01.png", 0, 3950, 1400, 950],
      swatches: ["01.png", 0, 4900, 1400, 950],
    },
  },
  "social-media-vol1": {
    screens: {
      p1: ["01.png", 180, 2205, 860, 1222],
      p2: ["01.png", 1190, 2205, 860, 1222],
      p3: ["01.png", 180, 3546, 860, 1222],
      p4: ["01.png", 1190, 3546, 860, 1222],
      p5: ["01.png", 180, 6258, 860, 1222],
      p6: ["01.png", 1190, 6258, 860, 1222],
    },
  },
};

for (const [slug, cfg] of Object.entries(CROPS)) {
  const src = `scripts/covers/source/${slug}/`;
  const out = `scripts/covers/assets/${slug}/`;
  await mkdir(out, { recursive: true });
  const rotated = cfg.rotate
    ? await sharp(src + cfg.rotate.file).rotate(cfg.rotate.deg, { background: "#ffffff" }).png().toBuffer()
    : null;
  for (const [name, [file, left, top, width, height]] of Object.entries(cfg.screens)) {
    const input = file ? src + file : rotated;
    await sharp(input).extract({ left, top, width, height }).png().toFile(`${out}${name}.png`);
  }
  if (cfg.logo) {
    // logo on white → transparent (un-blend the anti-aliased edge from white)
    // optional 6th value: the "white" level of the logo's backdrop (tinted tiles)
    const [file, left, top, width, height, white = 250] = cfg.logo;
    if (white === "raw") {
      await sharp(src + file).extract({ left, top, width, height }).png().toFile(`${out}logo.png`);
      console.log("✓", slug);
      continue;
    }
    const { data, info } = await sharp(src + file).extract({ left, top, width, height }).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      const a = Math.max(0, Math.min(1, (white - min) / (white - 60)));
      if (a > 0) for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, (data[i + c] - (1 - a) * 255) / a));
      data[i + 3] = Math.round(a * 255);
    }
    await sharp(data, { raw: info }).png().toFile(`${out}logo.png`);
  }
  console.log("✓", slug);
}
