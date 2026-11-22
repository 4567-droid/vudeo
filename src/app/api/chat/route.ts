import { createHash, timingSafeEqual } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { dynamicBlock, SYSTEM_PROMPT } from "@/lib/assistant/prompt";
import type { ChatEvent, ChatRequest } from "@/lib/assistant/types";

/*
 * Chat del asistente. La clave de Anthropic se lee solo acá, en el servidor
 * (ANTHROPIC_API_KEY), y nunca viaja al navegador.
 *
 * Variables de entorno:
 *   ANTHROPIC_API_KEY   obligatoria.
 *   ANTHROPIC_MODEL     opcional, por defecto claude-sonnet-5-5.
 *   CHAT_DAILY_LIMIT    opcional, mensajes por día (por defecto 30).
 *   RUMBO_ACCESS_CODE   opcional pero recomendada: si está, el chat pide ese código.
 */

const DEFAULT_MODEL = "claude-sonnet-5-5";
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 4000;
const MAX_CONTEXT_CHARS = 8000;
const MAX_TOKENS = 4096;

/** Modelos que aceptan el respaldo del servidor ante un rechazo (fallbacks: "default"). */
const FALLBACK_MODELS = new Set([
  "claude-sonnet-5-5",
  "claude-opus-5-5",
  "claude-opus-5",
  "claude-fable-5-1",
  "claude-fable-5-2",
]);

function model() {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}

function dailyLimit() {
  const n = Number(process.env.CHAT_DAILY_LIMIT);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 30;
}

function accessCodeOk(req: Request): boolean {
  const expected = process.env.RUMBO_ACCESS_CODE;
  if (!expected) return true;
  const given = req.headers.get("x-rumbo-code") ?? "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/*
 * Límite diario aproximado del lado del servidor. Vive en la memoria de cada instancia,
 * así que en Vercel es orientativo; el control principal está en el cliente y en el
 * código de acceso.
 */
const usage = new Map<string, { day: string; count: number }>();

function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

function overLimit(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const day = today();
  const entry = usage.get(ip);
  const count = entry && entry.day === day ? entry.count : 0;
  if (count >= dailyLimit()) return true;
  usage.set(ip, { day, count: count + 1 });
  if (usage.size > 500) usage.clear();
  return false;
}

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Daily-Limit": String(dailyLimit()) },
  });
}

/** Valida y recorta lo que manda el cliente. */
function parseBody(raw: unknown): ChatRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<ChatRequest>;
  if (!Array.isArray(r.messages)) return null;
  const messages = r.messages
    .filter(
      (m): m is ChatRequest["messages"][number] =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim() !== "",
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
    .slice(-MAX_MESSAGES);
  while (messages.length > 0 && messages[0].role !== "user") messages.shift();
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") return null;
  return {
    messages,
    context: typeof r.context === "string" ? r.context.slice(0, MAX_CONTEXT_CHARS) : "",
    christian: Boolean(r.christian),
  };
}

function errorEvent(err: unknown): Extract<ChatEvent, { t: "error" }> {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return { t: "error", code: "auth", message: "La clave de API del servidor no es válida. Revisá ANTHROPIC_API_KEY en Vercel." };
  }
  if (err instanceof Anthropic.NotFoundError) {
    return { t: "error", code: "model", message: `El modelo "${model()}" no está disponible. Revisá ANTHROPIC_MODEL.` };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return { t: "error", code: "rate", message: "Hay mucha demanda en este momento. Probá de nuevo en un minuto." };
  }
  if (err instanceof Anthropic.BadRequestError) {
    return { t: "error", code: "bad_request", message: "La consulta no se pudo procesar. Probá con un mensaje más corto." };
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return { t: "error", code: "connection", message: "No se pudo conectar con el servicio. Probá de nuevo." };
  }
  if (err instanceof Anthropic.APIError) {
    return { t: "error", code: "api", message: "El servicio respondió con un error. Probá de nuevo en un rato." };
  }
  return { t: "error", code: "unknown", message: "Algo salió mal. Probá de nuevo." };
}

/** Estado del asistente, para que la pantalla sepa si está configurado. */
export async function GET() {
  return json(200, {
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
    needsCode: Boolean(process.env.RUMBO_ACCESS_CODE),
    dailyLimit: dailyLimit(),
  });
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(503, { error: "not_configured", message: "Falta configurar ANTHROPIC_API_KEY en el servidor." });
  }
  if (!accessCodeOk(req)) {
    return json(401, { error: "bad_code", message: "El código de acceso no es correcto." });
  }

  let body: ChatRequest | null = null;
  try {
    body = parseBody(await req.json());
  } catch {
    body = null;
  }
  if (!body) return json(400, { error: "bad_request", message: "El mensaje llegó vacío o mal armado." });

  if (overLimit(req)) {
    return json(429, { error: "daily_limit", message: "Llegaste al límite de mensajes de hoy. Mañana seguimos." });
  }

  const client = new Anthropic({ apiKey });
  const name = model();
  const withFallback = FALLBACK_MODELS.has(name);
  const supportsEffort = /^claude-(opus|sonnet|haiku|fable|mythos)-5/.test(name);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        const response = client.beta.messages.stream(
          {
            model: name,
            max_tokens: MAX_TOKENS,
            ...(supportsEffort ? { output_config: { effort: "low" as const } } : {}),
            ...(withFallback
              ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
              : {}),
            system: [
              { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
              { type: "text", text: dynamicBlock(body.christian, body.context) },
            ],
            messages: body.messages,
          },
          { signal: req.signal },
        );
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ t: "text", v: event.delta.text });
          }
        }
        const final = await response.finalMessage();
        send({ t: "done", stop: final.stop_reason });
      } catch (err) {
        if (!req.signal.aborted) send(errorEvent(err));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Daily-Limit": String(dailyLimit()),
    },
  });
}
