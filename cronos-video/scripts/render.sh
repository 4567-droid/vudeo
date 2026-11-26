#!/usr/bin/env bash
# Genera la música y exporta el Reel (40 s) y la Story (15 s) en MP4 H.264 1080x1920 30 fps.
#   bash scripts/render.sh            -> out/cronos-reel-40s.mp4 y out/cronos-story-15s.mp4
# En tu compu no hace falta nada más. En un entorno sin acceso a la descarga de Chrome de
# Remotion, pasá el Chromium local:  BROWSER=/ruta/a/chrome-headless-shell bash scripts/render.sh
set -euo pipefail
cd "$(dirname "$0")/.."

python3 scripts/make_music.py public/music
for f in reel story; do
  # -14 LUFS integrados / -1 dBTP: el nivel que usa Instagram
  ffmpeg -y -hide_banner -loglevel error -i "public/music/$f.wav" \
    -af "loudnorm=I=-14:TP=-1.0:LRA=9" -ar 48000 -c:a aac -b:a 192k "public/music/$f.m4a"
  rm "public/music/$f.wav"
done

EXTRA=()
if [[ -n "${BROWSER:-}" ]]; then EXTRA+=("--browser-executable=$BROWSER"); fi

mkdir -p out
for comp in "CronosReel:out/cronos-reel-40s.mp4" "CronosStory:out/cronos-story-15s.mp4"; do
  id="${comp%%:*}"; file="${comp#*:}"
  npx remotion render "$id" "$file" --codec=h264 --crf=18 --pixel-format=yuv420p \
    --audio-codec=aac --audio-bitrate=192k ${EXTRA[@]+"${EXTRA[@]}"} "$@"
  # Rango de color estándar (BT.709 limitado) + faststart: lo que mejor digiere Instagram.
  ffmpeg -y -hide_banner -loglevel error -i "$file" \
    -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 17 \
    -profile:v high -level 4.1 -color_range tv -colorspace bt709 -color_primaries bt709 \
    -color_trc bt709 -c:a copy -movflags +faststart "${file%.mp4}.tmp.mp4"
  mv "${file%.mp4}.tmp.mp4" "$file"
done
ls -lh out/*.mp4
