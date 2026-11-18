// Renderiza fotogramas sueltos para revisar (texto cortado, contraste, tipografías).
// Uso: node scripts/stills.mjs <carpeta_salida> <frame> [frame...]
// Variable opcional REMOTION_BROWSER: ruta a un Chrome/Chromium headless ya instalado.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [outDir, ...frames] = process.argv.slice(2);
if (!outDir || frames.length === 0) {
  console.error("Uso: node scripts/stills.mjs <carpeta_salida> <frame> [frame...]");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || null;
const warnings = [];

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "FiloReel", browserExecutable });
for (const frame of frames.map(Number)) {
  const output = path.join(outDir, `frame-${String(frame).padStart(4, "0")}.png`);
  await renderStill({
    composition,
    serveUrl,
    frame,
    output,
    browserExecutable,
    onBrowserLog: (log) => {
      if (/\[(OVERFLOW|MINPX|OVERLAP)\]/.test(log.text)) warnings.push(`f${frame}: ${log.text}`);
    },
  });
  console.log("ok", output);
}
console.log(warnings.length ? "AVISOS:\n" + [...new Set(warnings)].join("\n") : "Sin avisos de texto (overflow / <60px / superposición).");
