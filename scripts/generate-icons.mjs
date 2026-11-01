// One-off generator for the app icons (DESIGN 2.6): a white question mark on a
// Primary Strong circle. Run with `npm run icons`; the PNGs are committed.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const RED = "#E35D5D";

// Question mark drawn on a 24x24 grid, centered around (12, 12).
function glyph(scale) {
  return `<g transform="translate(12 12) scale(${scale}) translate(-12 -13.2)">
    <path d="M8.5 8.6a3.6 3.6 0 0 1 7 1.1c0 2.4-3.5 3-3.5 5.3" fill="none" stroke="#FFFFFF"
      stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="19.2" r="1.8" fill="#FFFFFF"/>
  </g>`;
}

// Round icon on a transparent background.
const roundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="12" fill="${RED}"/>
  ${glyph(0.95)}
</svg>`;

// Full-bleed background; the glyph stays well inside the maskable safe zone.
const fullSvg = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect width="24" height="24" fill="${RED}"/>
  ${glyph(scale)}
</svg>`;

const outputs = [
  { file: "public/icons/icon-192.png", svg: roundSvg, size: 192 },
  { file: "public/icons/icon-512.png", svg: roundSvg, size: 512 },
  { file: "public/icons/icon-maskable-512.png", svg: fullSvg(0.7), size: 512 },
  { file: "public/icons/apple-touch-icon.png", svg: fullSvg(0.85), size: 180 },
  { file: "src/app/icon.png", svg: roundSvg, size: 48 },
];

await mkdir("public/icons", { recursive: true });
await writeFile("public/icons/icon.svg", roundSvg);
for (const { file, svg, size } of outputs) {
  await sharp(Buffer.from(svg), { density: 1200 }).resize(size, size).png().toFile(file);
  console.log(`wrote ${file} (${size}x${size})`);
}
