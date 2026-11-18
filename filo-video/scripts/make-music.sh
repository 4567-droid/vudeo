#!/usr/bin/env bash
# Genera la música original y la deja a volumen bajo (-20 LUFS, pico -2 dBTP).
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DUR="${1:-28.4}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
python3 -I "$HERE/scripts/make_music.py" "$TMP/raw.wav" "$DUR"
mkdir -p "$HERE/public/music"
ffmpeg -hide_banner -loglevel error -y -i "$TMP/raw.wav" \
  -af "loudnorm=I=-20:TP=-2:LRA=11" -ar 48000 -c:a aac -b:a 192k \
  "$HERE/public/music/filo-bed.m4a"
ffmpeg -hide_banner -nostats -i "$HERE/public/music/filo-bed.m4a" -af ebur128=peak=true -f null - 2>&1 \
  | grep -E "^\s+(I:|Peak:)" | sed 's/^/  /'
