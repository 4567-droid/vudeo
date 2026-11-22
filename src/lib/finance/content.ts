export const EXPENSE_CATEGORIES = [
  "Comida",
  "Transporte",
  "Vivienda",
  "Servicios",
  "Salud",
  "Gimnasio",
  "Salidas",
  "Ropa",
  "Deudas",
  "Otros",
];

export const INCOME_CATEGORIES = ["Sueldo", "Comisiones", "Extra", "Otros"];

export interface FinancePhase {
  number: 1 | 2 | 3;
  name: string;
  range: string;
  summary: string;
  tasks: { id: string; text: string }[];
}

/** Plan de finanzas en 3 fases, alineado con los 90 días del plan general. */
export const FINANCE_PHASES: FinancePhase[] = [
  {
    number: 1,
    name: "Ordenar y medir",
    range: "Días 1 a 30",
    summary: "Saber exactamente cuánto entra, cuánto sale y cuánto debés.",
    tasks: [
      { id: "f1-registrar", text: "Registrar todos los gastos durante 30 días, hasta los chicos." },
      { id: "f1-deudas", text: "Cargar todas tus deudas con saldo y cuota." },
      { id: "f1-presupuesto", text: "Armar el presupuesto del mes por categoría." },
      { id: "f1-fondo", text: "Definir el objetivo del fondo de emergencia." },
      { id: "f1-suscripciones", text: "Dar de baja suscripciones y gastos que no usás." },
    ],
  },
  {
    number: 2,
    name: "Pagar deudas y ahorrar",
    range: "Días 31 a 60",
    summary: "Liberar plata todos los meses y armar un colchón.",
    tasks: [
      { id: "f2-bola", text: "Pagar las cuotas y poner el extra en la deuda más chica." },
      { id: "f2-primer-mes", text: "Juntar el primer mes de gastos en el fondo de emergencia." },
      { id: "f2-pagate", text: "Separar un porcentaje fijo apenas cobrás." },
      { id: "f2-sin-nuevas", text: "No sumar deudas nuevas en todo el mes." },
    ],
  },
  {
    number: 3,
    name: "Hacer crecer ingresos",
    range: "Días 61 a 90",
    summary: "El ahorro tiene techo: lo que más mueve la aguja es ganar más.",
    tasks: [
      { id: "f3-comisiones", text: "Subir tu meta de cierres y de comisiones del mes." },
      { id: "f3-extra", text: "Definir una fuente de ingreso extra y dar el primer paso." },
      { id: "f3-formacion", text: "Invertir en una formación que te haga ganar más." },
      { id: "f3-metas", text: "Revisar las metas de ahorro y subirlas si podés." },
    ],
  },
];
