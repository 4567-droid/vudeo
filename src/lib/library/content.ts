export interface Lesson {
  id: string;
  topic: "finanzas" | "ventas";
  title: string;
  /** Párrafos cortos. */
  body: string[];
  /** Una acción concreta para hoy. */
  action: string;
}

/** Educación financiera básica, escrita con palabras propias. No es asesoramiento financiero. */
export const FINANCE_LESSONS: Lesson[] = [
  {
    id: "fin-pagate-primero",
    topic: "finanzas",
    title: "Pagate primero",
    body: [
      "Si ahorrás lo que sobra a fin de mes, casi nunca sobra nada. El gasto se estira hasta ocupar todo lo que hay.",
      "Dalo vuelta: apenas cobrás, separá un porcentaje para vos y viví con el resto. Aunque sea un 5% al principio, lo importante es el hábito.",
    ],
    action: "Decidí qué porcentaje vas a separar el próximo cobro y anotalo como meta de ahorro.",
  },
  {
    id: "fin-fondo",
    topic: "finanzas",
    title: "El fondo de emergencia",
    body: [
      "Es plata que no se toca salvo para una urgencia real: se rompe algo, te quedás sin trabajo, un problema de salud.",
      "La meta habitual es de 3 a 6 meses de gastos, pero empezá por uno. Tenerlo es lo que evita que una emergencia se convierta en una deuda nueva.",
    ],
    action: "Cargá el objetivo de tu fondo de emergencia con, al menos, un mes de gastos.",
  },
  {
    id: "fin-bola",
    topic: "finanzas",
    title: "La bola de nieve",
    body: [
      "Ordená tus deudas de la más chica a la más grande. Pagás la cuota de todas y todo lo extra va a la más chica.",
      "Cuando la cancelás, esa cuota se suma al extra y va a la siguiente. Cada deuda que cerrás te da impulso: por eso funciona aunque no sea la cuenta matemáticamente perfecta.",
    ],
    action: "Cargá todas tus deudas en Finanzas y mirá la fecha estimada de fin.",
  },
  {
    id: "fin-hormiga",
    topic: "finanzas",
    title: "Gastos hormiga",
    body: [
      "Un café, un delivery, una app que no usás. Cada uno parece nada, pero sumados en un mes pueden ser una cuota entera.",
      "No se trata de prohibirte todo, sino de verlos. Lo que se mide, se puede decidir.",
    ],
    action: "Registrá hoy cada gasto, por chico que sea, y a la noche mirá el total.",
  },
  {
    id: "fin-presupuesto",
    topic: "finanzas",
    title: "Cada peso con un destino",
    body: [
      "Un presupuesto no es una cárcel: es decidir antes de gastar en vez de enterarte después.",
      "Asigná un monto a cada categoría al principio del mes. Si una se pasa, sacás de otra a conciencia, no por accidente.",
    ],
    action: "Poné un presupuesto a tus tres categorías de gasto más grandes.",
  },
  {
    id: "fin-minimo",
    topic: "finanzas",
    title: "La trampa del pago mínimo",
    body: [
      "Pagar el mínimo de la tarjeta te deja al día, pero el resto genera intereses altos y la deuda puede durar años.",
      "Si hoy solo podés pagar el mínimo, no te castigues: es el punto de partida. El objetivo es dejar de sumar consumos y empezar a pagar más que el mínimo.",
    ],
    action: "Fijate cuánto de tu último resumen fue interés.",
  },
  {
    id: "fin-inflacion",
    topic: "finanzas",
    title: "La plata quieta pierde valor",
    body: [
      "Con inflación, los pesos guardados sin moverse compran cada vez menos. Por eso conviene aprender qué opciones existen para el ahorro.",
      "Antes de elegir dónde poner tu plata, entendé el riesgo, el plazo y cuándo la podés retirar. Para decisiones concretas, consultá a un profesional matriculado.",
    ],
    action: "Escribí para qué es tu ahorro y en cuánto tiempo lo vas a necesitar.",
  },
  {
    id: "fin-ingresos",
    topic: "finanzas",
    title: "El ahorro tiene techo, el ingreso no",
    body: [
      "Recortar gastos sirve hasta cierto punto: no podés bajar de cero. Ganar más no tiene ese límite.",
      "Tus ventas son tu palanca más directa: cada cierre de más es plata que va a deudas o ahorro.",
    ],
    action: "Calculá cuántos cierres de más por mes necesitarías para cancelar tu deuda más chica.",
  },
];

/** Ideas de Brian Tracy sobre ventas, contadas con palabras propias. */
export const SALES_LESSONS: Lesson[] = [
  {
    id: "ven-autoimagen",
    topic: "ventas",
    title: "Tu autoimagen vende antes que vos",
    body: [
      "Vendés de acuerdo a cómo te ves como vendedor. Si en el fondo creés que molestás, vas a llamar menos y a cerrar menos.",
      "Esa imagen se puede cambiar: con preparación, con práctica y con cómo te hablás a vos mismo antes de cada llamada.",
    ],
    action: "Escribí una frase de cómo querés verte como vendedor y leela antes de arrancar.",
  },
  {
    id: "ven-prospectar",
    topic: "ventas",
    title: "Prospectá todos los días",
    body: [
      "El embudo se llena antes de necesitarlo. Si solo buscás clientes cuando las ventas bajan, ya es tarde.",
      "Dedicá las primeras horas, cuando tenés más energía, a contactar gente nueva.",
    ],
    action: "Agregá hoy tres prospectos nuevos al CRM.",
  },
  {
    id: "ven-preguntar",
    topic: "ventas",
    title: "Preguntá más de lo que hablás",
    body: [
      "El que pregunta guía la conversación. Las preguntas abiertas (¿qué?, ¿cómo?, ¿por qué?) hacen que el cliente te cuente lo que necesita.",
      "Escuchá de verdad: la información para cerrar te la da el cliente.",
    ],
    action: "Prepará tres preguntas abiertas para tu próxima llamada.",
  },
  {
    id: "ven-resultados",
    topic: "ventas",
    title: "Vendé resultados, no características",
    body: [
      "La gente no compra lo que el producto es, compra lo que hace por ella: tiempo, plata, tranquilidad.",
      "Por cada característica que mencionás, preguntate: ¿y eso qué le cambia al cliente?",
    ],
    action: "Reescribí tu apertura para que hable de un resultado concreto.",
  },
  {
    id: "ven-objeciones",
    topic: "ventas",
    title: "Las objeciones son preguntas",
    body: [
      "Una objeción no es un no: es un pedido de más información. Si el cliente objeta, está pensando en comprar.",
      "Agradecela, entendé qué hay detrás y respondé eso, no la frase literal.",
    ],
    action: "Practicá con el asistente la objeción que más te cuesta.",
  },
  {
    id: "ven-pedir",
    topic: "ventas",
    title: "Pedí la venta",
    body: [
      "Muchas ventas se pierden porque nadie pidió el cierre. El vendedor espera que el cliente lo proponga y el cliente espera que se lo pidan.",
      "Cuando hay interés, preguntá directo: ¿avanzamos?",
    ],
    action: "En cada contacto efectivo de hoy, hacé al menos una pregunta de cierre.",
  },
  {
    id: "ven-rechazo",
    topic: "ventas",
    title: "El rechazo no es personal",
    body: [
      "El cliente dice que no a la propuesta, no a vos. Cada no es parte del número que te lleva al sí.",
      "Mirá tu conversión: si cerrás 1 de cada 20 llamadas, cada no te acerca al próximo cierre.",
    ],
    action: "Después de un no, anotá una cosa que aprendiste y seguí con la próxima.",
  },
  {
    id: "ven-sapo",
    topic: "ventas",
    title: "Hacé primero lo más difícil",
    body: [
      "La llamada que más te cuesta es la que más pesa en la cabeza mientras la postergás.",
      "Hacela primero: el resto del día se vuelve más liviano.",
    ],
    action: "Identificá la llamada más difícil de mañana y ponela primera.",
  },
  {
    id: "ven-aprender",
    topic: "ventas",
    title: "Aprendé un poco todos los días",
    body: [
      "Los mejores vendedores invierten en formación de forma constante: leen, escuchan audios en el viaje, practican.",
      "Treinta minutos por día suman muchas horas al año.",
    ],
    action: "Usá tu bloque de estudio de hoy para una lección de esta biblioteca.",
  },
];
