// Renders the hand-built project covers (scripts/covers/covers.html) to
// public/images/work/covers/<slug>.webp with headless Chrome, then sharp.
// Run: node scripts/render-covers.mjs [slug ...]   (no args = all covers)
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const BROWSERS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
];
const browser = BROWSERS.find(existsSync);
if (!browser) throw new Error("No Chrome/Edge found for rendering");

const page = resolve("scripts/covers/covers.html");
const html = await readFile(page, "utf8");
const all = [...html.matchAll(/<section class="cover[^"]*" id="([^"]+)"/g)].map((m) => m[1]);
const slugs = process.argv.length > 2 ? process.argv.slice(2) : all;

const OUT = "public/images/work/covers/";
await mkdir(OUT, { recursive: true });
const profile = join(tmpdir(), "yaser-cover-render");

for (const slug of slugs) {
  const png = join(tmpdir(), `cover-${slug}.png`);
  execFileSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--force-device-scale-factor=1",
    `--user-data-dir=${profile}`,
    "--window-size=1600,1000",
    "--virtual-time-budget=4000",
    `--screenshot=${png}`,
    `${pathToFileURL(page).href}?c=${slug}`,
  ], { stdio: "ignore" });
  await sharp(png).resize(1600, 1000).webp({ quality: 86 }).toFile(`${OUT}${slug}.webp`);
  await rm(png, { force: true });
  console.log("✓", slug);
}
