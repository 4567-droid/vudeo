// Genera los íconos PNG de la PWA a partir de un SVG.
// Uso: node scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FOREST = "#1F4D3A";
const PAPER = "#F6F4EF";

// Flecha de rumbo apuntando hacia arriba, centrada en un lienzo de 512.
// `scale` achica la flecha para la zona segura de los íconos "maskable".
function arrow(scale, color) {
  const s = scale;
  const cx = 256;
  const cy = 262;
  const pts = [
    [0, -150],
    [112, 122],
    [0, 66],
    [-112, 122],
  ]
    .map(([x, y]) => `${cx + x * s},${cy + y * s}`)
    .join(" ");
  return `<polygon points="${pts}" fill="${color}" stroke="${color}" stroke-width="${20 * s}" stroke-linejoin="round"/>`;
}

const svg = ({ rounded, scale, bg = FOREST, fg = PAPER }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${bg ? `<rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="${bg}"/>` : ""}
  ${arrow(scale, fg)}
</svg>`;

async function png(svgText, size, out) {
  const file = join(root, out);
  await mkdir(dirname(file), { recursive: true });
  await sharp(Buffer.from(svgText)).resize(size, size).png().toFile(file);
  console.log("ok", out);
}

await png(svg({ rounded: false, scale: 1 }), 192, "public/icons/icon-192.png");
await png(svg({ rounded: false, scale: 1 }), 512, "public/icons/icon-512.png");
await png(svg({ rounded: false, scale: 0.72 }), 512, "public/icons/icon-maskable-512.png");
await png(svg({ rounded: false, scale: 1 }), 180, "src/app/apple-icon.png");
// Ícono monocromo para la barra de estado de Android.
await png(svg({ rounded: false, scale: 1.1, bg: null, fg: "#FFFFFF" }), 96, "public/icons/badge-96.png");

await writeFile(join(root, "src/app/icon.svg"), svg({ rounded: true, scale: 0.9 }).trim() + "\n");
console.log("ok src/app/icon.svg");
