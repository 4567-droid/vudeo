// Identidad visual de Filo (ver ficha de marca).
export const C = {
  carbon: "#0F0F0E", // fondo principal
  hueso: "#F1EBDD", // texto y fondo claro
  cobre: "#D2793A", // acento
  piedra: "#8A857A", // secundario
  suave: "#C9C2B2", // texto suave
  cobreSobreClaro: "#A8531B", // cobre de texto sobre fondos claros
  panel: "#1B1B19", // superficie (de la página de marca)
  borde: "#3A3833", // borde de superficie (de la página de marca)
} as const;

export const FONT_TITLE = "'Archivo', sans-serif"; // 900 títulos, 800 subtítulos
export const FONT_TEXT = "'Inter', sans-serif"; // 400-600 textos

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Márgenes: las stories de la marca usan 100 px. Arriba dejamos aire extra
// para la interfaz de Reels/TikTok.
export const PAD = 100;
export const LOGO_TOP = 150;
export const TEXT_TOP = 300;
export const TEXT_MAX_W = W - PAD * 2; // 880 px
export const MIN_TEXT_PX = 60; // ningún texto agregado por debajo de 60 px
