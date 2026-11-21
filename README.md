# Rumbo

App web personal (PWA) para seguir un plan de 90 días y la racha sin consumir.
Está en español de Argentina y usa siempre la hora de Buenos Aires.

- **Hoy**: fecha, racha ("Día N") con anillo hacia el día 13 y los 7 hábitos del día.
- **Racha**: días sin consumir, grilla de los últimos 14 días, contador de 20 minutos para
  cuando aparecen las ganas, tarjeta del día 13 y "Registrar desliz".
- **Plan**: los 3 meses (Base, Foco, Expansión), la semana tipo, el plan para el día 13 y los
  ajustes (recordatorios, fechas de inicio y exportar a JSON).

## Correrla en la compu

```bash
npm install
npm run dev        # http://localhost:3000
```

Para probar la versión final: `npm run build && npm run start`.

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

`npm run dev` sirve para probar en la compu. Desde el celular por la red local
(`http://IP-de-tu-compu:3000`) la vas a poder ver, pero no instalar ni recibir notificaciones,
porque eso exige HTTPS.

## Recordatorios

A las 6:30, 15:30 (estudio), 17:30 (gimnasio o lo que toque ese día) y 22:30 (dormir). Los días
11, 12 y 13 de la racha, el aviso de las 6:30 cambia y HOY muestra un aviso fuerte.

Límite actual: sin servidor, el navegador no puede programar avisos con la app cerrada. Llegan
mientras Rumbo está abierta o quedó en segundo plano hace poco. Para que lleguen siempre hace
falta Web Push con un servidor; se puede sumar junto con Supabase.

## Datos

Todo se guarda en `localStorage`, solo en ese dispositivo. **Plan → Ajustes → Exportar a JSON**
descarga una copia.

La interfaz no toca `localStorage` directamente: usa la interfaz `RumboRepository`
(`src/lib/data/repository.ts`). Hoy la implementa `LocalRepository`. Para migrar a Supabase,
escribí una `SupabaseRepository` que cumpla esa interfaz y cambiala en `src/lib/data/index.ts`.

## Cómo se cuenta la racha

- La racha son los días corridos desde el último desliz (o desde la fecha de inicio).
- Olvidarte de tildar "Día sin consumir" no la corta. Solo la reinicia "Registrar desliz".
- El día del desliz el contador queda en 0 y al día siguiente arranca el día 1. El historial
  no se borra.
- En la grilla, verde = confirmado y gris = sin confirmar. El desliz se marca en ámbar, sin
  rojo. Tocando un día se confirma o se desmarca.

## Estructura

```
public/sw.js             service worker: sin conexión y notificaciones
public/icons/            íconos de la PWA (se regeneran con `npm run icons`)
src/app/                 pantallas (/, /racha, /plan), layout y manifiesto
src/components/          piezas de la interfaz
src/hooks/useRumbo.tsx   estado de la app conectado al repositorio
src/lib/data/            tipos, interfaz del repositorio e implementación local
src/lib/date.ts          fechas en America/Argentina/Buenos_Aires
src/lib/streak.ts        cálculo de racha e hitos
src/lib/habits.ts        los 7 hábitos
src/lib/plan.ts          metas de cada mes y semana tipo (editá acá para cambiarlas)
src/lib/notifications.ts permisos y recordatorios
```
