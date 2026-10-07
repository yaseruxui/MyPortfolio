// Renders the social share images (scripts/og/og.html) to public/og/og-<locale>.jpg.
// Run: node scripts/render-og.mjs
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const browser = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find(existsSync);
if (!browser) throw new Error("No Chrome/Edge found for rendering");

const page = pathToFileURL(resolve("scripts/og/og.html")).href;
await mkdir("public/og", { recursive: true });

for (const locale of ["ar", "en"]) {
  const png = join(tmpdir(), `og-${locale}.png`);
  execFileSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--force-device-scale-factor=1",
    `--user-data-dir=${join(tmpdir(), "yaser-og-render")}`,
    "--window-size=1200,630",
    "--virtual-time-budget=4000",
    `--screenshot=${png}`,
    `${page}?l=${locale}`,
  ], { stdio: "ignore" });
  await sharp(png).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile(`public/og/og-${locale}.jpg`);
  await rm(png, { force: true });
  console.log("✓", `public/og/og-${locale}.jpg`);
}
