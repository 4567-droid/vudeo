"use client";

import { useEffect, useRef } from "react";
import { useRumbo } from "@/hooks/useRumbo";
import { permissionState, scheduleReminders } from "@/lib/notifications";

/** Registra el service worker y programa los recordatorios. No dibuja nada. */
export function AppServices() {
  const { ready, data, streak } = useRumbo();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // En desarrollo el service worker no guarda caché, para no pisar los cambios en vivo.
    const url = process.env.NODE_ENV === "production" ? "/sw.js" : "/sw.js?cache=off";
    navigator.serviceWorker
      .register(url, { scope: "/", updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        // Pasarle al service worker los archivos que ya se cargaron, para tenerlos sin conexión.
        const urls = performance
          .getEntriesByType("resource")
          .map((e) => e.name)
          .filter((u) => new URL(u).pathname.startsWith("/_next/static/"));
        reg.active?.postMessage({ type: "CACHE_URLS", urls });
      })
      .catch(() => {
        /* sin service worker: la app funciona igual, sin modo offline */
      });
  }, []);

  const dayNumber = useRef(0);
  useEffect(() => {
    dayNumber.current = streak?.dayNumber ?? 0;
  }, [streak?.dayNumber]);

  const enabled = ready && Boolean(data?.settings.notificationsEnabled);
  useEffect(() => {
    if (!enabled || permissionState() !== "granted") return;
    return scheduleReminders(() => dayNumber.current);
  }, [enabled]);

  return null;
}
