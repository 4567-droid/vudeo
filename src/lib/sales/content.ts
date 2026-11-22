import type { ProspectStatus, SalesGoals, Script, ScriptKind } from "./types";

export const DEFAULT_GOALS: SalesGoals = {
  dailyCalls: 40,
  dailyContacts: 10,
  dailyClosings: 1,
  weeklyCalls: 200,
  weeklyContacts: 50,
  weeklyClosings: 5,
  commissionPerClosing: 0,
};

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  negociando: "Negociando",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

export const STATUSES: ProspectStatus[] = ["nuevo", "contactado", "negociando", "cerrado", "perdido"];

export const PREP_STEPS = [
  { id: "metas", text: "Revisé las metas del día" },
  { id: "lista", text: "Tengo la lista de a quién llamar" },
  { id: "guion", text: "Leí mi guion de apertura en voz alta" },
  { id: "mejora", text: "Repasé lo que quería mejorar hoy" },
  { id: "energia", text: "Dos minutos de postura y respiración antes de la primera llamada" },
];

export const SCRIPT_KIND_LABELS: Record<ScriptKind, string> = {
  apertura: "Apertura",
  objecion: "Objeciones",
  cierre: "Cierre",
};

/** Guiones de partida. Los corchetes son para completar con tu caso. */
export const DEFAULT_SCRIPTS: Omit<Script, "updatedAt">[] = [
  {
    id: "ap-frio",
    kind: "apertura",
    title: "Llamada en frío",
    body: "Hola, [nombre], ¿cómo estás? Soy [tu nombre], de [empresa]. Te llamo porque ayudamos a [tipo de cliente] a [resultado concreto]. ¿Tenés dos minutos para ver si te puede servir?",
  },
  {
    id: "ap-referido",
    kind: "apertura",
    title: "Contacto referido",
    body: "Hola, [nombre], soy [tu nombre]. [Quien te refirió] me pasó tu contacto porque pensó que te podía interesar [resultado]. ¿Es un buen momento para hablar unos minutos?",
  },
  {
    id: "ob-caro",
    kind: "objecion",
    title: "\"Es caro\"",
    body: "Te entiendo. ¿Caro comparado con qué? Dejemos el precio de lado un segundo: si no costara nada, ¿esto te resolvería [necesidad]? Si la respuesta es sí, veamos cómo hacerlo posible. Por mes, es [monto], o sea [monto por día] por día.",
  },
  {
    id: "ob-pensar",
    kind: "objecion",
    title: "\"Lo tengo que pensar\"",
    body: "Claro, tiene sentido. Para ayudarte a pensarlo: ¿qué es lo que todavía te genera dudas? ¿El precio, el momento o si realmente te sirve?",
  },
  {
    id: "ob-tiempo",
    kind: "objecion",
    title: "\"Ahora no tengo tiempo\"",
    body: "Perfecto, no te quiero sacar tiempo ahora. ¿Te queda bien que lo hablemos el [día] a las [hora]? Son diez minutos y te muestro si te sirve o no.",
  },
  {
    id: "ob-otro",
    kind: "objecion",
    title: "\"Ya trabajo con otro\"",
    body: "Bárbaro, entonces ya sabés lo importante que es esto. ¿Qué es lo que más te gusta de lo que tenés hoy? ¿Y qué es lo que mejorarías si pudieras?",
  },
  {
    id: "ob-mail",
    kind: "objecion",
    title: "\"Mandame info por mail\"",
    body: "Te la mando con gusto. Para mandarte lo que realmente te sirve y no un folleto genérico: ¿qué es lo más importante para vos a la hora de elegir [producto]?",
  },
  {
    id: "ci-alternativo",
    kind: "cierre",
    title: "Cierre alternativo",
    body: "¿Te queda mejor arrancar esta semana o la que viene?",
  },
  {
    id: "ci-resumen",
    kind: "cierre",
    title: "Cierre por resumen",
    body: "Repasemos: necesitás [necesidad 1] y [necesidad 2], y esto te resuelve [beneficio principal]. ¿Avanzamos?",
  },
  {
    id: "ci-paso",
    kind: "cierre",
    title: "Siguiente paso",
    body: "Con todo lo que hablamos, ¿cuál sería el próximo paso para que esto funcione para vos?",
  },
];
