import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Archivos woff2 tomados de la ficha de marca (Google Fonts, licencia OFL: public/fonts/OFL.txt).
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

const FACES: [family: string, file: string, range: string, weight: string][] = [
  ["Archivo", "fonts/archivo-latin.woff2", LATIN, "100 900"],
  ["Archivo", "fonts/archivo-latin-ext.woff2", LATIN_EXT, "100 900"],
  ["Inter", "fonts/inter-latin.woff2", LATIN, "100 900"],
  ["Inter", "fonts/inter-latin-ext.woff2", LATIN_EXT, "100 900"],
];

// Pesos que usa el video; si alguno no queda disponible, el render se corta con error
// en vez de salir con una tipografía de reemplazo.
const REQUIRED = ["900 100px Archivo", "800 60px Archivo", "600 60px Inter"];

const handle = delayRender("Cargando Archivo e Inter");

Promise.all(
  FACES.map(([family, file, unicodeRange, weight]) => {
    const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, {
      unicodeRange,
      weight,
      display: "block",
    });
    return face.load().then((loaded) => document.fonts.add(loaded));
  }),
)
  .then(() => Promise.all(REQUIRED.map((spec) => document.fonts.load(spec, "Ááé¿ñ"))))
  .then(() => {
    const missing = REQUIRED.filter((spec) => !document.fonts.check(spec, "Ááé¿ñ"));
    if (missing.length) throw new Error("Tipografías sin cargar: " + missing.join(", "));
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
