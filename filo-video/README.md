# Filo · Reel vertical (9:16)

Video de 28,4 s (1080×1920, 30 fps, H.264 + AAC) para Reels, TikTok e Instagram, con la identidad de **Filo**: carbón, hueso y cobre, Archivo 900/800 e Inter 400-600, y el logo de la navaja. Las transiciones son cortes diagonales rápidos, con una línea cobre como el filo del logo.

## Escenas

| Tiempo | Mensaje (texto en pantalla) | Imagen |
|---|---|---|
| 0–3 s | Dejá de contestar WhatsApp **para dar turnos.** | Foto de portada oscurecida |
| 3–6,4 s | Tu barbería, con su propia **web de turnos.** | Web de ejemplo en el celular |
| 6,4–10,2 s | No es una agenda genérica: es tu página, **con tu nombre.** | Zoom al nombre de la barbería, marcado en cobre |
| 10,2–17 s | Así reservan tus clientes. 1 Elegís sucursal y barbero · 2 Elegís día y horario · 3 Confirmás y listo | Pasos reales de la web; se marcan el horario y "Reservar turno" |
| 17–20 s | El turno queda **en la agenda del barbero.** | Agenda de Mateo, con el turno 13:30 marcado |
| 20–24 s | Panel de administrador: Ingresos, gastos y facturación **en un solo lugar.** | Resumen e Ingresos de la Central |
| 24–28,4 s | Logo · Turnos que cortan **en seco.** · Pedí tu **demo gratis.** · WhatsApp · @filoapp.ar | Cierre |

Las capturas son de la web de **ejemplo** armada para Bosco Barber Shop, y llevan la etiqueta "Ejemplo" en pantalla. Todos los textos tienen 60 px o más.

## Cómo regenerarlo

Requiere Node 18+, ffmpeg, pdfimages (poppler-utils) y Python 3 con numpy y Pillow.

```bash
npm install
npm run assets -- "/ruta/Propuesta Bosco Barber Shop - Turnos online.pdf"   # foto + capturas (no están en git)
npm run music            # opcional: la música ya está en public/music/filo-bed.m4a
npm run render           # -> /output/filo-reel.mp4  (o: npm run render -- otra/ruta.mp4)
npm run check            # contraste del texto en el video final (>= 4,5:1)
npm run studio           # editor visual de Remotion
```

Si Remotion no puede descargar su Chrome, apuntalo a uno instalado con
`REMOTION_BROWSER=/ruta/a/chrome-headless-shell npm run render`.

`npm run stills -- <carpeta> <frame> [frame...]` renderiza fotogramas sueltos y avisa si algún texto se pasa del ancho (880 px), queda por debajo de 60 px o se superpone con el celular.

## Dónde cambiar cada cosa

- Textos y escenas: `src/FiloReel.tsx`
- Tiempos: `src/timeline.ts`
- Colores, tipografías y márgenes: `src/brand.ts`
- Logo: `src/components/Logo.tsx` (SVG de la ficha de marca)
- Música: `scripts/make_music.py` (original, sintetizada desde cero, −20 LUFS)

## Licencias

- Archivo e Inter: SIL Open Font License, ver `public/fonts/OFL.txt`. Son los mismos archivos de Google Fonts que trae la ficha de marca.
- La música es original de este proyecto.
- La foto y las capturas de Bosco no se incluyen en el repositorio.
