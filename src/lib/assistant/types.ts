import type { DateKey } from "../date";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  /** cut = se cortó por largo; error = no llegó; refusal = el modelo no respondió. */
  status?: "cut" | "error" | "refusal";
}

export interface AssistantSettings {
  christian: boolean;
  /** Código de acceso si el servidor lo pide (RUMBO_ACCESS_CODE). Queda solo en este dispositivo. */
  accessCode: string;
}

export interface AssistantData {
  version: 1;
  messages: ChatMessage[];
  settings: AssistantSettings;
  /** Mensajes enviados hoy, para el límite diario. */
  usage: { date: DateKey; count: number };
  /** Límite diario que informó el servidor. */
  dailyLimit: number;
}

/** Lo que el cliente le manda a /api/chat. */
export interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  context: string;
  christian: boolean;
}

/** Cada línea de la respuesta en streaming (NDJSON). */
export type ChatEvent =
  | { t: "text"; v: string }
  | { t: "done"; stop: string | null }
  | { t: "error"; code: string; message: string };
