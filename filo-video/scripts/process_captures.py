"""Prepara las imágenes del PDF de Bosco para el video.

- Copia la foto de portada (sin los textos del PDF encima).
- Copia las capturas de celular originales (780x1688) que usa cada escena.
- En las capturas de la web de clientes tapa la franja "Versión de prueba"
  con el color de fondo de la app, para que el celular se vea limpio.

Uso: python3 -I process_captures.py <carpeta_pdfimages> <carpeta_salida>
"""
import os
import sys

import numpy as np
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

# nombre de salida -> (archivo de pdfimages, ¿tiene franja "Versión de prueba"?)
CAPTURES = {
    "web-portada.jpg": ("img-003-005.jpg", True),
    "paso-sucursal.jpg": ("img-004-011.jpg", True),
    "paso-barbero.jpg": ("img-004-017.jpg", True),
    "paso-horario.jpg": ("img-004-015.jpg", True),
    "paso-confirmar.jpg": ("img-004-021.jpg", True),
    "agenda-barbero.jpg": ("img-008-037.jpg", False),
    "admin-resumen.jpg": ("img-010-049.jpg", False),
    "admin-ingresos.jpg": ("img-010-051.jpg", False),
}
APP_BG = (13, 18, 11)  # fondo oscuro de la app de ejemplo


def banner_end(a: np.ndarray) -> int:
    """Primera fila (desde 60 px) donde ya no domina el color de la franja."""
    band = a[5, 5].astype(int)
    for y in range(60, 200):
        diff = np.abs(a[y].astype(int) - band).sum(axis=1)
        if (diff > 14).mean() > 0.6:
            return y
    raise SystemExit("No encontré el final de la franja de prueba")


for out_name, (src_name, has_banner) in CAPTURES.items():
    path = os.path.join(SRC, src_name)
    im = Image.open(path).convert("RGB")
    if im.size != (780, 1688):
        raise SystemExit(f"{src_name}: tamaño inesperado {im.size} (¿es el PDF correcto?)")
    if has_banner:
        a = np.asarray(im).copy()
        end = banner_end(a)
        a[:end] = APP_BG
        im = Image.fromarray(a)
        print(f"{out_name}: franja de prueba tapada (0-{end}px)")
    im.save(os.path.join(OUT, out_name), quality=95)

cover = Image.open(os.path.join(SRC, "img-001-000.jpg")).convert("RGB")
if cover.size != (768, 1152):
    raise SystemExit(f"Foto de portada con tamaño inesperado {cover.size}")
cover.save(os.path.join(OUT, "portada.jpg"), quality=95)
print("portada.jpg:", cover.size)
