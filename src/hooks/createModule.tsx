"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Lo mínimo que tiene que cumplir el repositorio de un módulo. */
export interface ModuleRepository<T> {
  load(): Promise<T>;
  subscribe(listener: (data: T) => void): () => void;
}

export interface ModuleValue<T, R> {
  /** null mientras se leen los datos (y durante el render en el servidor). */
  data: T | null;
  repo: R;
  /** Ejecuta una operación del repositorio y actualiza el estado con el resultado. */
  run(op: Promise<T>): Promise<void>;
}

/** Crea el Provider y el hook de un módulo a partir de su repositorio. */
export function createModule<T, R extends ModuleRepository<T>>(name: string, getRepo: () => R) {
  const Ctx = createContext<ModuleValue<T, R> | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
      const repo = getRepo();
      let alive = true;
      repo.load().then((d) => alive && setData(d));
      const unsubscribe = repo.subscribe((d) => setData(d));
      return () => {
        alive = false;
        unsubscribe();
      };
    }, []);

    const value = useMemo<ModuleValue<T, R>>(
      () => ({
        data,
        repo: getRepo(),
        run: async (op) => setData(await op),
      }),
      [data],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  function useModule(): ModuleValue<T, R> {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error(`use${name} debe usarse dentro de <${name}Provider>`);
    return ctx;
  }

  return [Provider, useModule] as const;
}
