/**
 * Entrega un archivo al usuario. En el celular abre el menú de compartir (desde ahí se
 * guarda en Archivos o se manda por WhatsApp); en la compu lo descarga.
 * En iPhone con la app instalada, una descarga común deja la app trabada en el PDF,
 * por eso se prefiere compartir.
 */
export async function saveFile(blob: Blob, filename: string): Promise<"shared" | "downloaded" | "cancelled"> {
  const file = new File([blob], filename, { type: blob.type });
  const touch = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  if (touch && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // Si compartir falla por otro motivo, se intenta la descarga común.
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "downloaded";
}
