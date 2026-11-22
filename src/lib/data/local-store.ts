/**
 * Guardado genérico en localStorage para los módulos (finanzas, ventas, biblioteca, asistente).
 * Cada módulo define su forma de datos, cómo crearla y cómo completarla si viene incompleta.
 */
export class LocalStore<T> {
  private cache: T | null = null;

  constructor(
    private readonly key: string,
    private readonly create: () => T,
    private readonly normalize: (raw: unknown) => T,
  ) {}

  read(): T {
    if (this.cache) return this.cache;
    let data: T;
    try {
      const raw = window.localStorage.getItem(this.key);
      data = raw ? this.normalize(JSON.parse(raw)) : this.create();
    } catch {
      data = this.create();
    }
    this.cache = data;
    return data;
  }

  write(data: T): T {
    this.cache = data;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(data));
    } catch {
      /* almacenamiento lleno o bloqueado: los datos quedan en memoria */
    }
    return data;
  }

  async mutate(fn: (data: T) => T): Promise<T> {
    return this.write(fn(this.read()));
  }

  subscribe(listener: (data: T) => void): () => void {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== this.key || !e.newValue) return;
      try {
        this.cache = this.normalize(JSON.parse(e.newValue));
        listener(this.cache);
      } catch {
        /* ignorar cambios ilegibles */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* Ayudas para normalizar datos leídos. */
export const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
export const asNumber = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
export const asString = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
export const asRecord = <T,>(v: unknown): Record<string, T> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, T>) : {};
