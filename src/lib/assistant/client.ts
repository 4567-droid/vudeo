import type { ChatEvent, ChatRequest } from "./types";

export interface ChatStatus {
  configured: boolean;
  needsCode: boolean;
  dailyLimit: number;
}

export async function fetchStatus(): Promise<ChatStatus | null> {
  try {
    const res = await fetch("/api/chat", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ChatStatus;
  } catch {
    return null;
  }
}

export class ChatError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Envía la conversación y va llamando a `onText` con cada pedazo de la respuesta.
 * Devuelve por qué terminó (`end_turn`, `max_tokens`, `refusal`…). Tira ChatError si falla.
 */
export async function streamChat(
  body: ChatRequest,
  accessCode: string,
  onText: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<{ stop: string | null; dailyLimit: number | null }> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessCode ? { "x-rumbo-code": accessCode } : {}) },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    if (signal?.aborted) throw new ChatError("aborted", "Cancelado.");
    throw new ChatError("offline", "No hay conexión. El asistente necesita internet.");
  }

  const limitHeader = Number(res.headers.get("X-Daily-Limit"));
  const dailyLimit = Number.isFinite(limitHeader) && limitHeader > 0 ? limitHeader : null;

  if (!res.ok || !res.body) {
    let message = "El asistente no respondió. Probá de nuevo.";
    let code = `http_${res.status}`;
    try {
      const data = (await res.json()) as { error?: string; message?: string };
      if (data.message) message = data.message;
      if (data.error) code = data.error;
    } catch {
      /* respuesta sin JSON */
    }
    throw new ChatError(code, message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let stop: string | null = null;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        const event = JSON.parse(line) as ChatEvent;
        if (event.t === "text") onText(event.v);
        else if (event.t === "done") stop = event.stop;
        else if (event.t === "error") throw new ChatError(event.code, event.message);
      }
    }
  } catch (err) {
    if (err instanceof ChatError) throw err;
    if (signal?.aborted) throw new ChatError("aborted", "Cancelado.");
    throw new ChatError("connection", "Se cortó la conexión en medio de la respuesta.");
  }
  return { stop, dailyLimit };
}
