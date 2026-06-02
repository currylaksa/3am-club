#!/usr/bin/env node
// Rasterise public/favicon.svg into the PWA PNG icons. Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../public");
const svg = readFileSync(resolve(dir, "favicon.svg"));

const make = (name, size, opts = {}) =>
  sharp(svg, { density: 384 })
    .resize(size, size, opts)
    .png()
    .toFile(resolve(dir, name));

await make("icon-192.png", 192);
await make("icon-512.png", 512);
// Maskable: inset the art into the safe zone (background bleeds to edges).
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#0f172a" },
})
  .composite([{ input: await make2(svg, 400), gravity: "center" }])
  .png()
  .toFile(resolve(dir, "icon-512-maskable.png"));

async function make2(svgBuf, size) {
  return sharp(svgBuf, { density: 384 }).resize(size, size).png().toBuffer();
}

console.log("Icons written to public/.");
