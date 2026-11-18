"""Mide el contraste (WCAG) del texto contra el fondo en fotogramas del video final.

Uso: python3 scripts/check_contrast.py /output/filo-reel.mp4
Toma el fondo más claro (percentil 99) dentro de cada zona de texto, para medir el peor caso.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter

VIDEO = sys.argv[1]
TEXT = {"hueso": "#F1EBDD", "cobre": "#D2793A", "suave": "#C9C2B2"}
# (segundo, zona, color del texto, recuadro x0,y0,x1,y1 donde está ese texto)
CHECKS = [
    (1.5, "gancho: Dejá de contestar WhatsApp", "hueso", (100, 600, 880, 1040)),
    (1.5, "gancho: para dar turnos.", "cobre", (100, 1040, 880, 1330)),
    (5.0, "web: Tu barbería, con su propia", "hueso", (100, 300, 980, 520)),
    (5.0, "web: web de turnos.", "cobre", (100, 520, 980, 640)),
    (13.0, "pasos: Así reservan…", "suave", (100, 300, 980, 370)),
    (13.0, "pasos: número", "cobre", (100, 400, 240, 580)),
    (13.0, "pasos: texto del paso", "hueso", (250, 400, 980, 610)),
    (22.0, "admin: Panel de administrador", "suave", (100, 300, 980, 370)),
    (22.0, "admin: Ingresos, gastos…", "hueso", (100, 390, 980, 590)),
    (22.0, "admin: en un solo lugar.", "cobre", (100, 590, 980, 690)),
    (28.3, "cierre: eslogan en seco.", "cobre", (560, 565, 980, 645)),
    (28.3, "cierre: Pedí tu", "hueso", (100, 880, 980, 1010)),
    (28.3, "cierre: demo gratis.", "cobre", (100, 1010, 980, 1160)),
    (28.3, "cierre: contactos", "hueso", (100, 1220, 980, 1420)),
]


def rgb(h):
    return np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], dtype=float)


def lum(a):
    c = a / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return c @ np.array([0.2126, 0.7152, 0.0722])


def ratio(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


worst_all = 99.0
with tempfile.TemporaryDirectory() as tmp:
    for t, name, color, (x0, y0, x1, y1) in CHECKS:
        png = os.path.join(tmp, f"{t}.png")
        if not os.path.exists(png):
            subprocess.run(
                ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(t), "-i", VIDEO, "-frames:v", "1", png],
                check=True,
            )
        crop = np.asarray(Image.open(png).convert("RGB")).astype(float)[y0:y1, x0:x1]
        dist = np.min([np.abs(crop - rgb(TEXT[c])).sum(2) for c in TEXT], axis=0)
        # Máscara de texto ensanchada 5 px: deja afuera el borde suavizado de las letras,
        # que si no se contaría como "fondo" y bajaría el contraste medido.
        text_mask = Image.fromarray(((dist < 300) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(11))
        bg = lum(crop[np.asarray(text_mask) == 0])
        p99 = float(np.percentile(bg, 99))
        r = ratio(float(lum(rgb(TEXT[color]))), p99)
        worst_all = min(worst_all, r)
        print(f"{t:>5}s {name:38s} {color:6s} {r:5.1f}:1")
print(f"Peor caso: {worst_all:.1f}:1 (objetivo >= 4.5:1)")
sys.exit(0 if worst_all >= 4.5 else 1)
