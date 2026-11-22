# Rumbo

App web personal (PWA) para seguir un plan de 90 días: racha sin consumir, finanzas, ventas y
un coach con IA. Está en español de Argentina y usa siempre la hora de Buenos Aires.

- **Hoy**: fecha, racha ("Día N") con anillo hacia el día 13 y los 7 hábitos del día.
- **Racha**: días sin consumir, grilla de los últimos 14 días, contador de 20 minutos para
  cuando aparecen las ganas, tarjeta del día 13 y "Registrar desliz".
- **Plan**: los 3 meses (Base, Foco, Expansión), la semana tipo, el plan para el día 13 y los
  ajustes (recordatorios, fechas de inicio y exportar a JSON).
- **Finanzas**: registro en dos toques (monto y categoría), ARS o USD con tipo de cambio cargado
  a mano, presupuesto por categoría, deudas con método bola de nieve y fecha estimada de fin,
  fondo de emergencia y metas de ahorro, plan en 3 fases y resumen mensual en PDF.
- **Ventas**: contadores de un toque (llamadas, contactos efectivos, cierres) con conversión del
  día, metas diarias y semanales, comisión estimada, mini CRM con seguimientos, ritual de antes y
  después de la jornada y reporte semanal en PDF.
- **Asistente**: chat con un coach (Claude) que conoce un resumen de tus datos. Atajos: "Armá mi
  día", "Tengo un impulso", "Revisá mis gastos", "Practicá una objeción de venta" y "Resumen de
  la semana".
- **Biblioteca**: guiones de venta editables y lecciones cortas de ventas y de finanzas.

Todo funciona sin conexión salvo el asistente.

## Correrla en la compu

```bash
npm install
cp .env.example .env.local   # solo si querés probar el asistente; completá la clave
npm run dev                  # http://localhost:3000
```

Para probar la versión final: `npm run build && npm run start`.

## Variables de entorno

Se cargan en Vercel en **Settings → Environment Variables** (y en `.env.local` para la compu).

| Variable | ¿Hace falta? | Para qué |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sí, para el asistente | Clave de la API de Anthropic. Se usa solo en el servidor (`/api/chat`); nunca llega al navegador. |
| `ANTHROPIC_MODEL` | No | Modelo del asistente. Por defecto `claude-sonnet-5-5`. |
| `CHAT_DAILY_LIMIT` | No | Mensajes por día. Por defecto 30. |
| `RUMBO_ACCESS_CODE` | Recomendada | Código que el asistente pide una vez por dispositivo. Sin él, cualquiera que encuentre la dirección podría usar el chat con tu clave. |

Después de cargarlas o cambiarlas, hay que volver a publicar (**Deployments → Redeploy**).

## Instalarla en el celular

Para instalarse como app, el navegador necesita que la página llegue por **HTTPS**. La forma
más simple es publicarla gratis en Vercel:

1. Pasá el código a la rama principal del repositorio (`main`).
2. Entrá a [vercel.com](https://vercel.com), iniciá sesión con GitHub, elegí **Add New → Project**
   e importá este repositorio. No hace falta cambiar nada: Vercel detecta Next.js solo.
3. Al terminar te da una dirección del tipo `https://rumbo-xxxx.vercel.app`.

Después, en el celular:

- **Android (Chrome)**: abrí la dirección, tocá el menú ⋮ y elegí **Instalar app**
  (o **Agregar a pantalla principal**).
- **iPhone (Safari)**: abrí la dirección, tocá **Compartir** y elegí **Agregar a inicio**.

Abrí Rumbo desde el ícono y activá los recordatorios en **Plan → Ajustes**.

> En iPhone, la app instalada guarda sus datos aparte de Safari. Instalala primero y usala
> siempre desde el ícono.

## PDF

Los resúmenes de Finanzas y de Ventas se arman en el mismo celular, sin conexión. En el celular
se abre el menú de compartir (desde ahí se guardan en Archivos o se mandan por WhatsApp); en la
compu se descargan.

## Recordatorios

A las 6:30, 8:00 (seguimientos de ventas, solo si hay), 15:30 (estudio), 17:30 (gimnasio o lo
que toque ese día) y 22:30 (dormir). Los días 11, 12 y 13 de la racha, el aviso de las 6:30
cambia y HOY muestra un aviso fuerte.

Límite actual: sin servidor de notificaciones, el navegador no puede programar avisos con la app
cerrada. Llegan mientras Rumbo está abierta o quedó en segundo plano hace poco. Para que lleguen
siempre hace falta Web Push con un servidor; se puede sumar junto con Supabase.

## Asistente

- La clave vive solo en el servidor. El navegador le pide a `/api/chat`, que llama a la API de
  Anthropic y devuelve la respuesta en streaming.
- Con cada mensaje viaja un resumen de tus datos (racha, hábitos de hoy, números del mes y de
  ventas), solo para esa consulta. No incluye nombres de prospectos ni notas. En **Asistente →
  Ajustes → Ver qué datos se envían** está el texto exacto.
- El límite diario se controla en el celular y, de forma aproximada, en el servidor. El código
  de acceso es la protección real.
- La conversación se guarda en el celular (los últimos 60 mensajes).

## Datos

Todo se guarda en `localStorage`, solo en ese dispositivo. **Plan → Ajustes → Exportar a JSON**
descarga una copia de todos los módulos (sin el código de acceso).

Las pantallas no tocan `localStorage` directamente: cada módulo tiene su interfaz de repositorio.
Para migrar a Supabase, escribí otra implementación de cada interfaz y cambiala en el `index.ts`
del módulo:

| Módulo | Interfaz | Implementación actual |
|---|---|---|
| Racha y hábitos | `src/lib/data/repository.ts` | `LocalRepository` |
| Finanzas | `src/lib/finance/repository.ts` | `LocalFinanceRepository` |
| Ventas | `src/lib/sales/repository.ts` | `LocalSalesRepository` |
| Biblioteca y asistente | `src/lib/library/index.ts`, `src/lib/assistant/index.ts` | `LocalStore` |

## Cómo se cuenta la racha

- La racha son los días corridos desde el último desliz (o desde la fecha de inicio).
- Olvidarte de tildar "Día sin consumir" no la corta. Solo la reinicia "Registrar desliz".
- El día del desliz el contador queda en 0 y al día siguiente arranca el día 1. El historial
  no se borra.
- En la grilla, verde = confirmado y gris = sin confirmar. El desliz se marca en ámbar, sin
  rojo. Tocando un día se confirma o se desmarca.

## Estructura

```
public/sw.js               service worker: sin conexión y notificaciones
public/icons/              íconos de la PWA (se regeneran con `npm run icons`)
src/app/                   pantallas, layout y manifiesto
src/app/api/chat/route.ts  ruta del servidor del asistente
src/components/            piezas de la interfaz (finance/, sales/, assistant/)
src/hooks/                 estado de la app (useRumbo y el armado de cada módulo)
src/lib/data/              racha: tipos, repositorio y guardado local
src/lib/finance/           finanzas: tipos, cálculos (bola de nieve), contenido y PDF
src/lib/sales/             ventas: tipos, cálculos, guiones de partida y PDF
src/lib/library/           lecciones de ventas y de finanzas
src/lib/assistant/         asistente: prompt (servidor), resumen de datos y cliente del chat
src/lib/plan.ts            metas de cada mes y semana tipo (editá acá para cambiarlas)
src/lib/notifications.ts   permisos y recordatorios
```
