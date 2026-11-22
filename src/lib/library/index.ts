import { createModule } from "@/hooks/createModule";
import { asArray, asRecord, LocalStore } from "../data/local-store";

export interface LibraryData {
  version: 1;
  /** Lecciones marcadas como leídas. */
  read: string[];
}

const store = new LocalStore<LibraryData>(
  "rumbo:biblioteca:v1",
  () => ({ version: 1, read: [] }),
  (raw) => ({ version: 1, read: asArray<string>(asRecord<unknown>(raw).read) }),
);

export interface LibraryRepository {
  load(): Promise<LibraryData>;
  subscribe(listener: (data: LibraryData) => void): () => void;
  toggleRead(lessonId: string): Promise<LibraryData>;
}

const repo: LibraryRepository = {
  load: async () => store.read(),
  subscribe: (l) => store.subscribe(l),
  toggleRead: (id) =>
    store.mutate((d) => ({
      ...d,
      read: d.read.includes(id) ? d.read.filter((x) => x !== id) : [...d.read, id],
    })),
};

export const [LibraryProvider, useLibrary] = createModule<LibraryData, LibraryRepository>(
  "Library",
  () => repo,
);
