// Línea de tiempo en fotogramas (30 fps). Total: 852 f = 28,4 s.
// La música va a 80 BPM (1 compás = 90 f): la batería entra en el f 90 y sale en el f 720.
export const CUT = 10; // duración del corte diagonal entre escenas
export const SWAP = 8; // duración del corte diagonal dentro de una escena

export const T = {
  hook: 0, // 1. Gancho
  web: 90, // 2. Tu barbería, con su propia web de turnos.
  webSwap: 192, // 3. No es una agenda genérica: es tu página, con tu nombre.
  zoomIn: [184, 212] as const,
  nameMark: [212, 228] as const,
  how: 306, // 4. Cómo reservan los clientes
  steps: {
    sucursal: 306,
    barbero: 342,
    horario: 378,
    confirmar: 444,
    agenda: 510, // El turno queda en la agenda del barbero.
  },
  admin: 600, // 5. Panel de administrador
  adminSwap: 660,
  close: 720, // 6. Cierre
  end: 852,
};

export const TOTAL_FRAMES = T.end;
