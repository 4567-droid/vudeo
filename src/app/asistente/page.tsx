"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MessageText } from "@/components/assistant/MessageText";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader, Skeleton } from "@/components/PageHeader";
import { Field, inputClass, Sheet } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { useAssistant, usedToday, type ChatMessage } from "@/lib/assistant";
import { ChatError, fetchStatus, streamChat, type ChatStatus } from "@/lib/assistant/client";
import { buildContext } from "@/lib/assistant/context";
import { useFinance } from "@/lib/finance";
import { useSales } from "@/lib/sales";

const SHORTCUTS = [
  { label: "Armá mi día", text: "Armá mi día de hoy con mis hábitos, mis metas de ventas y lo que tengo pendiente." },
  { label: "Tengo un impulso", text: "Tengo ganas de consumir ahora. Ayudame a atravesar los próximos 20 minutos." },
  { label: "Revisá mis gastos", text: "Revisá mis gastos de este mes y decime qué ves y un solo ajuste para hacer." },
  {
    label: "Practicá una objeción de venta",
    text: "Practiquemos una objeción de venta. Hacé de cliente, planteame una objeción difícil y esperá mi respuesta.",
  },
  { label: "Resumen de la semana", text: "Haceme un resumen de mi semana: racha, hábitos, finanzas y ventas." },
];

const HISTORY_FOR_API = 16;

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export default function AsistentePage() {
  const rumbo = useRumbo();
  const finance = useFinance().data;
  const sales = useSales().data;
  const { data, repo, run } = useAssistant();
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);

  const [status, setStatus] = useState<ChatStatus | null | "loading">("loading");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // El estado del servidor se consulta una vez al entrar; al salir se corta lo que esté en curso.
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);
  useEffect(() => {
    let alive = true;
    fetchStatus().then((s) => {
      if (!alive) return;
      setStatus(s);
      if (s) void runRef.current(repo.setDailyLimit(s.dailyLimit));
    });
    return () => {
      alive = false;
      abortRef.current?.abort();
    };
  }, [repo]);

  const messageCount = data?.messages.length ?? 0;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount, streaming]);

  if (!rumbo.ready || !data) {
    return (
      <>
        <PageHeader title="Asistente" />
        <div className="mt-4">
          <Skeleton heights={[200, 120]} />
        </div>
      </>
    );
  }

  const used = usedToday(data, rumbo.today);
  const left = Math.max(0, data.dailyLimit - used);
  const needsCode = status !== "loading" && status?.needsCode && !data.settings.accessCode;
  const notConfigured = status !== "loading" && status !== null && !status.configured;
  const busy = streaming !== null;
  const canSend = online && !busy && left > 0 && !needsCode && !notConfigured;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || !canSend) return;
    setInput("");
    const history = data.messages
      .filter((m) => !m.status || m.status === "cut")
      .slice(-HISTORY_FOR_API + 1)
      .map((m) => ({ role: m.role, content: m.content }));
    await run(repo.addMessage({ role: "user", content }));
    setStreaming("");
    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "";
    try {
      const result = await streamChat(
        {
          messages: [...history, { role: "user", content }],
          context: buildContext(rumbo.data, finance, sales, rumbo.today),
          christian: data.settings.christian,
        },
        data.settings.accessCode,
        (chunk) => {
          acc += chunk;
          setStreaming(acc);
        },
        controller.signal,
      );
      await run(repo.countUse(rumbo.today));
      if (result.dailyLimit) await run(repo.setDailyLimit(result.dailyLimit));
      const statusTag: ChatMessage["status"] =
        result.stop === "refusal" ? "refusal" : result.stop === "max_tokens" ? "cut" : undefined;
      await run(
        repo.addMessage({
          role: "assistant",
          content:
            result.stop === "refusal" && !acc.trim()
              ? "No puedo responder eso. Si estás pasando un momento difícil, llamá a la Línea 141 o al 911."
              : acc,
          status: statusTag,
        }),
      );
    } catch (err) {
      if (err instanceof ChatError && err.code === "aborted") return;
      const message = err instanceof ChatError ? err.message : "Algo salió mal. Probá de nuevo.";
      if (acc.trim()) await run(repo.addMessage({ role: "assistant", content: acc, status: "cut" }));
      await run(repo.addMessage({ role: "assistant", content: message, status: "error" }));
      if (err instanceof ChatError && err.code === "bad_code") setSettingsOpen(true);
    } finally {
      setStreaming(null);
      abortRef.current = null;
    }
  };

  const lastUser = [...data.messages].reverse().find((m) => m.role === "user");

  return (
    <>
      <PageHeader eyebrow="Coach de crecimiento, finanzas y ventas" title="Asistente">
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="tabular min-w-0 text-sm text-muted" aria-live="polite">
            {left > 0 ? `Quedan ${left} de ${data.dailyLimit} mensajes hoy` : "Llegaste al límite de hoy"}
          </p>
          <div className="flex shrink-0">
            <button type="button" onClick={() => setHelpOpen(true)} className="min-h-[44px] whitespace-nowrap rounded-xl px-2.5 text-sm font-semibold text-amber-ink">
              Ayuda urgente
            </button>
            <button type="button" onClick={() => setSettingsOpen(true)} className="min-h-[44px] whitespace-nowrap rounded-xl px-2.5 text-sm font-semibold text-muted">
              Ajustes
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="mt-3 space-y-3">
        {!online && (
          <Card tone="amber">
            <p className="text-[15px] font-semibold">Sin conexión</p>
            <p className="mt-1 text-[15px]">
              El asistente necesita internet. Si tenés ganas de consumir, el contador de 20 minutos funciona sin conexión.
            </p>
            <ButtonLink href="/racha" variant="amber" className="mt-3 w-full">
              Ir al contador de 20 minutos
            </ButtonLink>
          </Card>
        )}
        {notConfigured && (
          <Card tone="amber">
            <p className="text-[15px] font-semibold">El asistente todavía no está configurado</p>
            <p className="mt-1 text-[15px]">Falta cargar la variable ANTHROPIC_API_KEY en Vercel y volver a publicar.</p>
          </Card>
        )}
        {needsCode && <AccessCodeCard />}

        {data.messages.length === 0 && !busy && (
          <Card>
            <h2 className="text-lg font-semibold">¿En qué te ayudo?</h2>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">
              Conozco tu racha, tus hábitos de hoy, tus números y tus ventas. Respondo corto y te propongo un paso por vez.
            </p>
          </Card>
        )}

        <ol className="space-y-3" aria-label="Conversación">
          {data.messages.map((m) => (
            <Bubble key={m.id} message={m} onRetry={m.status === "error" && lastUser ? () => send(lastUser.content) : undefined} canRetry={canSend} />
          ))}
          {busy && (
            <li className="max-w-[88%] rounded-[20px] rounded-bl-md bg-white px-4 py-3 text-[16px] leading-relaxed">
              {streaming ? <MessageText text={streaming} /> : <span className="text-muted">Pensando…</span>}
            </li>
          )}
        </ol>
        <div ref={endRef} style={{ height: 190 }} aria-hidden />
      </div>

      <Composer
        input={input}
        setInput={setInput}
        onSend={send}
        canSend={canSend}
        busy={busy}
        onStop={() => abortRef.current?.abort()}
        placeholder={
          !online ? "Sin conexión" : left === 0 ? "Llegaste al límite de hoy" : needsCode ? "Cargá el código de acceso" : "Escribí tu mensaje"
        }
      />

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

function Bubble({ message, onRetry, canRetry }: { message: ChatMessage; onRetry?: () => void; canRetry: boolean }) {
  if (message.role === "user") {
    return (
      <li className="ml-auto max-w-[85%] whitespace-pre-line rounded-[20px] rounded-br-md bg-forest px-4 py-3 text-[16px] leading-relaxed text-white">
        {message.content}
      </li>
    );
  }
  if (message.status === "error") {
    return (
      <li className="max-w-[88%] rounded-[20px] rounded-bl-md bg-amber px-4 py-3 text-[15px] text-amber-ink">
        {message.content}
        {onRetry && (
          <button type="button" onClick={onRetry} disabled={!canRetry} className="mt-1 block min-h-[44px] font-semibold underline underline-offset-4 disabled:opacity-50">
            Reintentar
          </button>
        )}
      </li>
    );
  }
  return (
    <li className="max-w-[88%] rounded-[20px] rounded-bl-md bg-white px-4 py-3 text-[16px] leading-relaxed">
      <MessageText text={message.content} />
      {message.status === "cut" && <p className="mt-2 text-sm text-muted">La respuesta quedó cortada.</p>}
    </li>
  );
}

function Composer({
  input,
  setInput,
  onSend,
  canSend,
  busy,
  onStop,
  placeholder,
}: {
  input: string;
  setInput(v: string): void;
  onSend(text: string): void;
  canSend: boolean;
  busy: boolean;
  onStop(): void;
  placeholder: string;
}) {
  return (
    <div
      className="fixed inset-x-0 z-20 border-t border-line bg-paper/95 backdrop-blur"
      style={{ bottom: "calc(61px + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-[430px] px-4 pb-2 pt-2">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2" role="group" aria-label="Atajos">
          {SHORTCUTS.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={!canSend}
              onClick={() => onSend(s.text)}
              className="min-h-[40px] shrink-0 rounded-full border border-line bg-white px-3.5 text-[13px] font-semibold disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSend(input);
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Mensaje
          </label>
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !("ontouchstart" in window)) {
                e.preventDefault();
                onSend(input);
              }
            }}
            placeholder={placeholder}
            className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-line bg-white px-4 py-3 text-[16px] leading-snug focus:border-forest/60 focus:outline-none"
          />
          {busy ? (
            <Button variant="secondary" type="button" onClick={onStop} className="px-4">
              Parar
            </Button>
          ) : (
            <Button type="submit" disabled={!canSend || input.trim() === ""} className="px-4">
              Enviar
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}

function AccessCodeCard() {
  const { repo, run } = useAssistant();
  const [code, setCode] = useState("");
  return (
    <Card>
      <h2 className="text-lg font-semibold">Código de acceso</h2>
      <p className="mt-1 text-[15px] text-muted">
        Tu asistente está protegido con un código para que nadie más use tu cuenta. Se guarda solo en este celular.
      </p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) void run(repo.updateSettings({ accessCode: code.trim() }));
        }}
      >
        <input id="access-code" type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} aria-label="Código de acceso" />
        <Button type="submit" disabled={!code.trim()}>
          Guardar
        </Button>
      </form>
    </Card>
  );
}

function SettingsSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const { data, repo, run } = useAssistant();
  const rumbo = useRumbo();
  const finance = useFinance().data;
  const sales = useSales().data;
  const [code, setCode] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  if (!data) return null;
  const christian = data.settings.christian;

  return (
    <Sheet open={open} onClose={onClose} title="Ajustes del asistente">
      <div className="space-y-5">
        <button
          type="button"
          role="switch"
          aria-checked={christian}
          onClick={() => run(repo.updateSettings({ christian: !christian }))}
          className="flex min-h-[56px] w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="block text-[15px] font-medium">Enfoque cristiano</span>
            <span className="block text-sm text-muted">Suma una mirada de fe breve, sin dejar el paso práctico.</span>
          </span>
          <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${christian ? "bg-forest" : "bg-line"}`}>
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left] ${christian ? "left-7" : "left-1"}`} />
          </span>
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code !== null) void run(repo.updateSettings({ accessCode: code.trim() }));
            setCode(null);
          }}
        >
          <Field label="Código de acceso" hint="Solo si configuraste RUMBO_ACCESS_CODE en Vercel.">
            <div className="flex gap-2">
              <input
                id="settings-code"
                type="password"
                autoComplete="off"
                value={code ?? data.settings.accessCode}
                onChange={(e) => setCode(e.target.value)}
                className={inputClass}
              />
              <Button type="submit" variant="secondary" disabled={code === null}>
                Guardar
              </Button>
            </div>
          </Field>
        </form>

        <details className="rounded-2xl bg-paper px-4">
          <summary className="flex min-h-[52px] cursor-pointer items-center text-[15px] font-medium">
            Ver qué datos se envían
          </summary>
          <p className="text-sm text-muted">
            Con cada mensaje viaja este resumen, solo para esa consulta. No incluye nombres de prospectos ni notas.
          </p>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap pb-4 text-[13px] leading-relaxed">
            {buildContext(rumbo.data, finance, sales, rumbo.today)}
          </pre>
        </details>

        {confirmClear ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setConfirmClear(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await run(repo.clearMessages());
                setConfirmClear(false);
                onClose();
              }}
            >
              Borrar
            </Button>
          </div>
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => setConfirmClear(true)}>
            Borrar la conversación
          </Button>
        )}
      </div>
    </Sheet>
  );
}

function HelpSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const lines = [
    { label: "Emergencias", number: "911", detail: "o 107 para una ambulancia" },
    { label: "Línea 141 · SEDRONAR", number: "141", detail: "Consumos problemáticos. Gratuita, las 24 horas." },
    { label: "Centro de Asistencia al Suicida", number: "135", detail: "Desde CABA y GBA. Desde todo el país: 0800 345 1435." },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Ayuda urgente">
      <p className="text-[15px] leading-relaxed text-muted">
        Si estás en crisis o en riesgo, no estás solo. Llamá ahora o pedile a alguien de confianza que esté con vos.
      </p>
      <ul className="mt-4 space-y-2">
        {lines.map((l) => (
          <li key={l.number}>
            <a href={`tel:${l.number}`} className="flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <span>
                <span className="block text-[15px] font-semibold">{l.label}</span>
                <span className="block text-sm text-muted">{l.detail}</span>
              </span>
              <span className="tabular text-xl font-semibold text-forest">{l.number}</span>
            </a>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
