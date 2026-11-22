import { createModule } from "@/hooks/createModule";
import { asArray, asNumber, asRecord, asString, LocalStore, newId } from "../data/local-store";
import type { DateKey } from "../date";
import type { AssistantData, AssistantSettings, ChatMessage } from "./types";

export * from "./types";

export const DEFAULT_DAILY_LIMIT = 30;
const MAX_STORED_MESSAGES = 60;

function create(): AssistantData {
  return {
    version: 1,
    messages: [],
    settings: { christian: false, accessCode: "" },
    usage: { date: "", count: 0 },
    dailyLimit: DEFAULT_DAILY_LIMIT,
  };
}

function normalize(raw: unknown): AssistantData {
  const r = asRecord<unknown>(raw);
  const s = asRecord<unknown>(r.settings);
  const u = asRecord<unknown>(r.usage);
  return {
    version: 1,
    messages: asArray<ChatMessage>(r.messages).slice(-MAX_STORED_MESSAGES),
    settings: { christian: Boolean(s.christian), accessCode: asString(s.accessCode) },
    usage: { date: asString(u.date), count: asNumber(u.count) },
    dailyLimit: asNumber(r.dailyLimit, DEFAULT_DAILY_LIMIT),
  };
}

const store = new LocalStore<AssistantData>("rumbo:asistente:v1", create, normalize);

export interface AssistantRepository {
  load(): Promise<AssistantData>;
  subscribe(listener: (data: AssistantData) => void): () => void;
  addMessage(m: Omit<ChatMessage, "id" | "createdAt">): Promise<AssistantData>;
  clearMessages(): Promise<AssistantData>;
  /** Cuenta un mensaje enviado hoy. */
  countUse(date: DateKey): Promise<AssistantData>;
  setDailyLimit(limit: number): Promise<AssistantData>;
  updateSettings(patch: Partial<AssistantSettings>): Promise<AssistantData>;
}

const repo: AssistantRepository = {
  load: async () => store.read(),
  subscribe: (l) => store.subscribe(l),
  addMessage: (m) =>
    store.mutate((d) => ({
      ...d,
      messages: [...d.messages, { ...m, id: newId(), createdAt: new Date().toISOString() }].slice(
        -MAX_STORED_MESSAGES,
      ),
    })),
  clearMessages: () => store.mutate((d) => ({ ...d, messages: [] })),
  countUse: (date) =>
    store.mutate((d) => ({
      ...d,
      usage: { date, count: d.usage.date === date ? d.usage.count + 1 : 1 },
    })),
  setDailyLimit: (limit) =>
    store.mutate((d) => (d.dailyLimit === limit ? d : { ...d, dailyLimit: limit })),
  updateSettings: (patch) => store.mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
};

export function usedToday(data: AssistantData, today: DateKey): number {
  return data.usage.date === today ? data.usage.count : 0;
}

export const [AssistantProvider, useAssistant] = createModule<AssistantData, AssistantRepository>(
  "Assistant",
  () => repo,
);
