import { TIME_ZONE, todayKey } from "./date";
import type { AppData } from "./data/types";

export function buildExport(data: AppData) {
  return {
    app: "Rumbo",
    exportedAt: new Date().toISOString(),
    timeZone: TIME_ZONE,
    data,
  };
}

export function downloadJson(data: AppData): void {
  const json = JSON.stringify(buildExport(data), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rumbo-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
