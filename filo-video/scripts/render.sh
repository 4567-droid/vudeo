#!/usr/bin/env bash
# Renderiza el reel 1080x1920 (H.264 + AAC) para Reels / TikTok / Instagram.
# Uso: npm run render -- [salida.mp4]        (por defecto: /output/filo-reel.mp4)
# Variable opcional REMOTION_BROWSER: ruta a un Chrome/Chromium headless ya instalado.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-/output/filo-reel.mp4}"
cd "$HERE"

for f in web-portada paso-sucursal paso-barbero paso-horario paso-confirmar agenda-barbero admin-resumen admin-ingresos portada; do
  [ -f "public/assets/bosco/$f.jpg" ] || { echo "Falta public/assets/bosco/$f.jpg: corré 'npm run assets -- <pdf>'"; exit 1; }
done
[ -f public/music/filo-bed.m4a ] || bash scripts/make-music.sh

mkdir -p "$(dirname "$OUT")"
args=()
[ -n "${REMOTION_BROWSER:-}" ] && args+=(--browser-executable "$REMOTION_BROWSER")
npx remotion render src/index.ts FiloReel "$OUT" \
  --codec h264 --crf 18 --pixel-format yuv420p --color-space bt709 \
  --audio-codec aac --audio-bitrate 192k \
  --concurrency "${CONCURRENCY:-4}" "${args[@]}"
