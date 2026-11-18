#!/usr/bin/env bash
# Extrae del PDF "Propuesta Bosco Barber Shop - Turnos online" la foto de portada
# y las capturas de celular que usa el video, y las deja en public/assets/bosco/.
# Esas imágenes son material de Bosco (ejemplo): no se suben al repo (.gitignore).
#
# Uso: npm run assets -- "/ruta/Propuesta Bosco Barber Shop - Turnos online.pdf"
set -euo pipefail

PDF="${1:?Uso: npm run assets -- /ruta/a/la/propuesta.pdf}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# -all: imágenes en su formato original; -p: prefijo con número de página.
pdfimages -all -p -f 1 -l 11 "$PDF" "$TMP/img"
python3 -I "$HERE/scripts/process_captures.py" "$TMP" "$HERE/public/assets/bosco"
