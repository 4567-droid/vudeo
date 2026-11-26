// Paleta y medidas compartidas por el Reel y la Story.
export const C = {
  red: "#E3001B",
  white: "#FFFFFF",
  black: "#0A0A0B",
  green: "#25D366",
} as const;

export const DISPLAY = "Anton"; // titulares y números (condensada, muy pesada)
export const SANS = "Archivo"; // bajadas, etiquetas y texto legal

// Zonas seguras de Instagram en 1080x1920:
// arriba queda la barra de perfil/pestañas y abajo el texto del post, usuario y respuesta.
export const SAFE = { top: 250, bottom: 420, side: 80 } as const;

export const SHADOW = "0 6px 24px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)";
