"use client";

import { useEffect, useRef } from "react";
import { useRumbo } from "@/hooks/useRumbo";
import { permissionState, scheduleReminders, type ReminderContext } from "@/lib/notifications";
import { useSales } from "@/lib/sales";
import { dueFollowUps } from "@/lib/sales/calc";

/** Registra el service worker y programa los recordatorios. No dibuja nada. */
export function AppServices() {
  const { ready, data, streak, today } = useRumbo();
  const sales = useSales().data;

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

  const context = useRef<ReminderContext>({ dayNumber: 0, followUps: 0 });
  useEffect(() => {
    context.current = {
      dayNumber: streak?.dayNumber ?? 0,
      followUps: sales && today ? dueFollowUps(sales, today).length : 0,
    };
  }, [streak?.dayNumber, sales, today]);

  const enabled = ready && Boolean(data?.settings.notificationsEnabled);
  useEffect(() => {
    if (!enabled || permissionState() !== "granted") return;
    return scheduleReminders(() => context.current);
  }, [enabled]);

  return null;
}
