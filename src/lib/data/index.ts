import { LocalRepository } from "./local-repository";
import type { RumboRepository } from "./repository";

export type { RumboRepository } from "./repository";
export * from "./types";

let instance: RumboRepository | null = null;

/**
 * Punto único donde se elige la persistencia.
 * Para migrar: `instance = new SupabaseRepository(client)`.
 */
export function getRepository(): RumboRepository {
  if (!instance) instance = new LocalRepository();
  return instance;
}
