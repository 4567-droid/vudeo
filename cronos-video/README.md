# Cronos — comercial vertical para Instagram (Remotion)

Comercial de Fiat Cronos 0km con plan de ahorro para Scuderia Fiat.

| Composición   | Duración | Uso                                          |
| ------------- | -------- | -------------------------------------------- |
| `CronosReel`  | 40 s     | Reel (gancho, auto, solución, plan, urgencia, WhatsApp) |
| `CronosStory` | 15 s     | Stories (gancho, plan, WhatsApp)             |

Las dos son 1080x1920, 30 fps. Copy del post: [COPY-INSTAGRAM.md](COPY-INSTAGRAM.md).

## Ver y editar

```bash
npm install
npm run dev        # abre Remotion Studio
```

- Tiempos y textos de cada escena: `src/CronosReel.tsx` y `src/CronosStory.tsx`.
- Escenas: `src/scenes/` · tomas de foto, destellos, legal y animaciones: `src/components/`.
- Colores, tipografías y zonas seguras de Instagram: `src/theme.ts`.
- Fotos: `public/fotos/` (se usan en orden alfabético de archivo).

## Música

`scripts/make_music.py` sintetiza la pista (sin samples ni copyright) a 120 BPM, así cada
corte cae en un beat (15 fotogramas). Trae los golpes sincronizados con los textos y un drop
con impacto cuando aparece el anticipo. Si movés tiempos en las composiciones, actualizá
las listas de golpes del script.

## Exportar

```bash
bash scripts/render.sh   # -> out/cronos-reel-40s.mp4 y out/cronos-story-15s.mp4 (H.264)
```

Regenera la música (normalizada a -14 LUFS) y renderiza las dos versiones.
