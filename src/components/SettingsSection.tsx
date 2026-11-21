"use client";

import { useState, useSyncExternalStore } from "react";
import { useRumbo } from "@/hooks/useRumbo";
import { isValidKey } from "@/lib/date";
import { downloadJson } from "@/lib/export";
import {
  notify,
  permissionState,
  requestPermission,
  type NotificationPermissionState,
} from "@/lib/notifications";
import { Button } from "./Button";
import { Card } from "./Card";

const noSubscribe = () => () => {};

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function SettingsSection() {
  return (
    <section aria-labelledby="ajustes" className="space-y-3">
      <h2 id="ajustes" className="px-1 pt-4 text-xl font-semibold">
        Ajustes
      </h2>
      <RemindersCard />
      <DatesCard />
      <ExportCard />
    </section>
  );
}

function RemindersCard() {
  const { data, updateSettings } = useRumbo();
  const browserPermission = useSyncExternalStore(
    noSubscribe,
    permissionState,
    (): NotificationPermissionState => "default",
  );
  const iosBrowser = useSyncExternalStore(
    noSubscribe,
    () => isIOS() && !isStandalone(),
    () => false,
  );
  const [requested, setPermission] = useState<NotificationPermissionState | null>(null);
  const permission = requested ?? browserPermission;
  const [tested, setTested] = useState<null | boolean>(null);

  const enabled = Boolean(data?.settings.notificationsEnabled) && permission === "granted";

  const enable = async () => {
    const result = await requestPermission();
    setPermission(result);
    if (result === "granted") await updateSettings({ notificationsEnabled: true });
  };

  let status: string;
  if (permission === "unsupported") {
    status = iosBrowser
      ? "En iPhone, las notificaciones funcionan solo con Rumbo instalada en la pantalla de inicio."
      : "Este navegador no permite notificaciones.";
  } else if (permission === "denied") {
    status =
      "Las notificaciones están bloqueadas. Habilitalas para este sitio en los ajustes del navegador.";
  } else if (enabled) {
    status = "Activados: 6:30, 15:30 (estudio), 17:30 (gimnasio) y 22:30 (dormir).";
  } else {
    status = "Te avisa a las 6:30, 15:30 (estudio), 17:30 (gimnasio) y 22:30 (dormir).";
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold">Recordatorios</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{status}</p>

      {permission !== "unsupported" && permission !== "denied" && (
        <div className="mt-4 flex gap-2">
          {enabled ? (
            <>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={async () => setTested(await notify("Rumbo", "Así te van a llegar los recordatorios.", "rumbo-test"))}
              >
                Probar
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => updateSettings({ notificationsEnabled: false })}
              >
                Desactivar
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={enable}>
              Activar recordatorios
            </Button>
          )}
        </div>
      )}
      {tested === false && (
        <p className="mt-2 text-sm text-amber-ink">No se pudo mostrar la notificación.</p>
      )}

      <p className="mt-4 text-sm leading-relaxed text-muted">
        Sin servidor, los avisos llegan mientras Rumbo está abierta o quedó en segundo plano hace
        poco. Con la app cerrada del todo, el teléfono puede no mostrarlos.
      </p>
    </Card>
  );
}

function DatesCard() {
  const { data, today, updateSettings } = useRumbo();
  if (!data) return null;

  return (
    <Card>
      <h3 className="text-lg font-semibold">Fechas</h3>
      <label className="mt-3 block">
        <span className="text-[15px] font-medium">Inicio del plan de 90 días</span>
        <input
          type="date"
          value={data.settings.planStartDate}
          onChange={(e) =>
            isValidKey(e.target.value) && updateSettings({ planStartDate: e.target.value })
          }
          className="mt-1.5 block min-h-[48px] w-full rounded-2xl border border-line bg-white px-4 text-[16px]"
        />
      </label>
      <label className="mt-4 block">
        <span className="text-[15px] font-medium">Inicio de la racha</span>
        <span className="block text-sm text-muted">
          Cambialo si ya venías sumando días antes de usar Rumbo.
        </span>
        <input
          type="date"
          value={data.settings.streakStartDate}
          max={today}
          onChange={(e) =>
            isValidKey(e.target.value) &&
            e.target.value <= today &&
            updateSettings({ streakStartDate: e.target.value })
          }
          className="mt-1.5 block min-h-[48px] w-full rounded-2xl border border-line bg-white px-4 text-[16px]"
        />
      </label>
    </Card>
  );
}

function ExportCard() {
  const { data } = useRumbo();
  return (
    <Card>
      <h3 className="text-lg font-semibold">Tus datos</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
        Se guardan solo en este dispositivo. Exportalos para tener una copia.
      </p>
      <Button
        variant="secondary"
        className="mt-4 w-full"
        disabled={!data}
        onClick={() => data && downloadJson(data)}
      >
        Exportar a JSON
      </Button>
    </Card>
  );
}
