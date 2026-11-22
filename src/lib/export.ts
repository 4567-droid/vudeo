import { TIME_ZONE, todayKey } from "./date";
import type { AppData } from "./data/types";
import type { AssistantData } from "./assistant/types";
import type { FinanceData } from "./finance/types";
import type { LibraryData } from "./library";
import type { SalesData } from "./sales/types";
import { saveFile } from "./share-file";

export interface ExportInput {
  core: AppData;
  finance: FinanceData | null;
  sales: SalesData | null;
  library: LibraryData | null;
  assistant: AssistantData | null;
}

export function buildExport(input: ExportInput) {
  const assistant = input.assistant
    ? {
        ...input.assistant,
        // El código de acceso no sale del dispositivo.
        settings: { ...input.assistant.settings, accessCode: "" },
      }
    : null;
  return {
    app: "Rumbo",
    exportedAt: new Date().toISOString(),
    timeZone: TIME_ZONE,
    data: input.core,
    finanzas: input.finance,
    ventas: input.sales,
    biblioteca: input.library,
    asistente: assistant,
  };
}

export function downloadJson(input: ExportInput) {
  const json = JSON.stringify(buildExport(input), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  return saveFile(blob, `rumbo-${todayKey()}.json`);
}
