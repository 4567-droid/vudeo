import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { DISPLAY, SANS } from "./theme";

// Fuentes locales (OFL) para que el render no dependa de internet.
// loadFont() frena el render hasta que cada fuente está cargada.
loadFont({ family: DISPLAY, url: staticFile("fonts/anton-latin-400-normal.woff2"), weight: "400" });
loadFont({ family: SANS, url: staticFile("fonts/archivo-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: SANS, url: staticFile("fonts/archivo-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: SANS, url: staticFile("fonts/archivo-latin-900-normal.woff2"), weight: "900" });
