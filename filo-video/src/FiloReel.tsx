import React from "react";
import { AbsoluteFill, Html5Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import "./fonts";
import { C, FONT_TEXT, H, LOGO_TOP, PAD, TEXT_MAX_W, TEXT_TOP, W } from "./brand";
import { clamp, inOutEase, outEase, progress } from "./anim";
import { CUT, SWAP, T } from "./timeline";
import { CutStack } from "./components/CutStack";
import { LogoLockup } from "./components/Logo";
import { acc, Title } from "./components/Title";
import { BEZEL, Box, ExampleTag, Phone, PHONE_W, SCREEN_H, SCREEN_W, SHOT_W, Shot } from "./components/Phone";

// Capturas de la web de ejemplo (PDF de Bosco). Se generan con `npm run assets`.
const SHOT = {
  portada: "assets/bosco/web-portada.jpg",
  sucursal: "assets/bosco/paso-sucursal.jpg",
  barbero: "assets/bosco/paso-barbero.jpg",
  horario: "assets/bosco/paso-horario.jpg",
  confirmar: "assets/bosco/paso-confirmar.jpg",
  agenda: "assets/bosco/agenda-barbero.jpg",
  resumen: "assets/bosco/admin-resumen.jpg",
  ingresos: "assets/bosco/admin-ingresos.jpg",
};
const COVER = "assets/bosco/portada.jpg";

// Elementos reales de las capturas que se marcan en cobre (px de la captura 780x1688).
const NAME: Box = { x: 250, y: 128, w: 280, h: 102 }; // "BOSCO / BARBER SHOP"
const HORA: Box = { x: 35, y: 1050, w: 225, h: 100 }; // horario 13:30 elegido
const RESERVAR: Box = { x: 283, y: 1413, w: 462, h: 112 }; // botón "Reservar turno"
const TURNO: Box = { x: 27, y: 693, w: 726, h: 134 }; // 13:30 Juan Pérez en la agenda de Mateo

const K = SCREEN_W / SHOT_W;
// La etiqueta "Ejemplo" se apoya sobre el borde del celular sin tapar la pantalla.
const TAG_LIFT = 84;
// Franja superior donde viven los textos: el corte diagonal de texto barre sólo esta zona,
// así cambia al mismo tiempo que la pantalla del celular.
const TEXT_ZONE_H = 760;
const PHONE_LEFT = (W - PHONE_W) / 2;

// ---------- piezas comunes ----------

const DarkBg: React.FC = () => (
  <AbsoluteFill
    style={{ background: `radial-gradient(120% 70% at 50% 78%, #1C1B19 0%, ${C.carbon} 60%)` }}
  />
);

/**
 * Foto de portada oscurecida con carbón. `stops` = [posición 0..1, opacidad del carbón]:
 * más oscuro donde hay texto cobre, para que el contraste no baje de 4,5:1.
 */
const PhotoBg: React.FC<{ from: number; dur: number; stops: [number, number][] }> = ({ from, dur, stops }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [from, from + dur], [1.12, 1], clamp);
  const gradient = stops.map(([p, a]) => `rgba(15,15,14,${a}) ${p * 100}%`).join(", ");
  return (
    <AbsoluteFill style={{ background: C.carbon, overflow: "hidden" }}>
      <Img
        src={staticFile(COVER)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s})`,
          filter: "saturate(0.55)",
        }}
      />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${gradient})` }} />
    </AbsoluteFill>
  );
};

/** Logo chico arriba a la izquierda, como en las piezas de la marca (ícono 80 + FILO 62 px). */
const SmallLogo: React.FC = () => (
  <div style={{ position: "absolute", left: PAD, top: LOGO_TOP }}>
    <LogoLockup icon={80} word={62} gap={22} />
  </div>
);

const pos = (top: number): React.CSSProperties => ({ position: "absolute", left: PAD, top });

// ---------- 1. Gancho ----------

const HookScene: React.FC = () => (
  <AbsoluteFill>
    <PhotoBg
      from={T.hook}
      dur={T.web + CUT}
      stops={[[0, 0.86], [0.3, 0.72], [0.5, 0.86], [0.72, 0.91], [1, 0.95]]}
    />
    <SmallLogo />
    <Title
      id="gancho"
      size={140}
      revealFrom={null} // visible desde el primer fotograma (miniatura y autoplay)
      style={pos(600)}
      maxBottom={1500}
      lines={["Dejá de", "contestar", "WhatsApp", [acc("para dar")], [acc("turnos.")]]}
    />
  </AbsoluteFill>
);

// ---------- 2 y 3. Web propia / con tu nombre ----------

const WebScene: React.FC = () => {
  const f = useCurrentFrame();
  const enter = progress(f, T.web, 20);
  const kb = interpolate(f, [T.web, T.zoomIn[0]], [0, 1], clamp);
  const z = interpolate(f, [T.zoomIn[0], T.zoomIn[1]], [0, 1], { ...clamp, easing: inOutEase });
  const s = interpolate(z, [0, 1], [1 + 0.03 * kb, 1.7]);
  // centro del nombre dentro del celular
  const nx = BEZEL + (NAME.x + NAME.w / 2) * K;
  const ny = BEZEL + (NAME.y + NAME.h / 2) * K;
  const top0 = 760;
  const cy = interpolate(z, [0, 1], [top0 + ny, 1010]);
  const left = W / 2 - nx * s;
  const top = cy - ny * s + (1 - enter) * 160;
  const right = left + PHONE_W * s;

  return (
    <AbsoluteFill>
      <DarkBg />
      <SmallLogo />
      <Phone style={{ left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${left}px, ${top}px) scale(${s})` }}>
        <Shot src={SHOT.portada} from={T.web} dur={1} zoom={0} mark={NAME} markAt={T.nameMark[0]} />
      </Phone>
      <ExampleTag opacity={enter} style={{ right: Math.max(40, W - right - 24), top: top - TAG_LIFT }} />
      <CutStack
        w={W}
        h={TEXT_ZONE_H}
        dur={SWAP}
        transparent
        layers={[
          {
            from: T.web,
            node: (
              <Title
                id="web-propia"
                size={104}
                revealFrom={T.web + 6}
                style={pos(TEXT_TOP)}
                maxBottom={700}
                lines={["Tu barbería,", "con su propia", [acc("web de turnos.")]]}
              />
            ),
          },
          {
            from: T.webSwap,
            node: (
              <Title
                id="tu-nombre"
                size={96}
                style={pos(TEXT_TOP)}
                maxBottom={712}
                lines={["No es una agenda", "genérica: es tu", ["página, ", acc("con")], [acc("tu nombre.")]]}
              />
            ),
          },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---------- 4. Cómo reservan los clientes ----------

const Step: React.FC<{ n: number; lines: string[]; revealFrom: number | null }> = ({ n, lines, revealFrom }) => (
  <>
    <Title
      id="kicker-reservan"
      size={60}
      weight={800}
      letterSpacing={-0.5}
      color={C.suave}
      revealFrom={revealFrom}
      style={pos(TEXT_TOP)}
      lines={["Así reservan tus clientes."]}
    />
    <div style={{ position: "absolute", left: PAD, top: TEXT_TOP + 104, display: "flex", gap: 26 }}>
      <Title
        id={`numero-${n}`}
        size={176}
        lineHeight={0.84}
        color={C.cobre}
        maxWidth={130}
        revealFrom={revealFrom === null ? null : revealFrom + 2}
        style={{ width: 130 }}
        lines={[String(n)]}
      />
      <Title
        id={`paso-${n}`}
        size={88}
        maxWidth={TEXT_MAX_W - 156}
        revealFrom={revealFrom === null ? null : revealFrom + 4}
        style={{ paddingTop: 10 }}
        lines={lines}
      />
    </div>
  </>
);

const HowScene: React.FC = () => {
  const f = useCurrentFrame();
  const enter = progress(f, T.how, 20);
  const top = 740 + (1 - enter) * 160;
  const st = T.steps;
  return (
    <AbsoluteFill>
      <DarkBg />
      <SmallLogo />
      <Phone style={{ left: PHONE_LEFT, top }}>
        <CutStack
          w={SCREEN_W}
          h={SCREEN_H}
          dur={SWAP}
          blade={5}
          layers={[
            { from: st.sucursal, node: <Shot src={SHOT.sucursal} from={st.sucursal} dur={36} zoom={0.03} /> },
            { from: st.barbero, node: <Shot src={SHOT.barbero} from={st.barbero} dur={36} zoom={0.03} /> },
            {
              from: st.horario,
              node: <Shot src={SHOT.horario} from={st.horario} dur={66} zoom={0.05} focus={HORA} mark={HORA} markAt={st.horario + 14} />,
            },
            {
              from: st.confirmar,
              node: <Shot src={SHOT.confirmar} from={st.confirmar} dur={66} zoom={0.05} focus={RESERVAR} mark={RESERVAR} markAt={st.confirmar + 14} />,
            },
            {
              from: st.agenda,
              node: <Shot src={SHOT.agenda} from={st.agenda} dur={90} zoom={0.05} focus={TURNO} mark={TURNO} markAt={st.agenda + 14} />,
            },
          ]}
        />
      </Phone>
      <ExampleTag opacity={enter} style={{ right: W - (PHONE_LEFT + PHONE_W) - 24, top: top - TAG_LIFT }} />
      <CutStack
        w={W}
        h={TEXT_ZONE_H}
        dur={SWAP}
        transparent
        layers={[
          { from: st.sucursal, node: <Step n={1} lines={["Elegís sucursal", "y barbero"]} revealFrom={T.how + 2} /> },
          { from: st.horario, node: <Step n={2} lines={["Elegís día", "y horario"]} revealFrom={null} /> },
          { from: st.confirmar, node: <Step n={3} lines={["Confirmás", "y listo"]} revealFrom={null} /> },
          {
            from: st.agenda,
            node: (
              <Title
                id="agenda"
                size={104}
                style={pos(TEXT_TOP)}
                maxBottom={680}
                lines={["El turno queda", [acc("en la agenda")], [acc("del barbero.")]]}
              />
            ),
          },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---------- 5. Panel de administrador ----------

const AdminScene: React.FC = () => {
  const f = useCurrentFrame();
  const enter = progress(f, T.admin, 20);
  const top = 790 + (1 - enter) * 160;
  return (
    <AbsoluteFill>
      <DarkBg />
      <SmallLogo />
      <Phone style={{ left: PHONE_LEFT, top }}>
        <CutStack
          w={SCREEN_W}
          h={SCREEN_H}
          dur={SWAP}
          blade={5}
          layers={[
            { from: T.admin, node: <Shot src={SHOT.resumen} from={T.admin} dur={60} zoom={0.04} /> },
            { from: T.adminSwap, node: <Shot src={SHOT.ingresos} from={T.adminSwap} dur={60} zoom={0.04} /> },
          ]}
        />
      </Phone>
      <ExampleTag opacity={enter} style={{ right: W - (PHONE_LEFT + PHONE_W) - 24, top: top - TAG_LIFT }} />
      <Title
        id="kicker-admin"
        size={60}
        weight={800}
        letterSpacing={-0.5}
        color={C.suave}
        revealFrom={T.admin + 6}
        style={pos(TEXT_TOP)}
        lines={["Panel de administrador"]}
      />
      <Title
        id="admin"
        size={92}
        revealFrom={T.admin + 9}
        style={pos(TEXT_TOP + 92)}
        maxBottom={700}
        lines={["Ingresos, gastos", "y facturación", [acc("en un solo lugar.")]]}
      />
    </AbsoluteFill>
  );
};

// ---------- 6. Cierre ----------

const ChatIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke={C.cobre} strokeWidth="5" strokeLinejoin="round">
    <path d="M32 7c13.8 0 25 10.3 25 23s-11.2 23-25 23c-3.6 0-7-.7-10.1-2L9 56l3.6-11.4C9.4 40.7 7 35.6 7 30 7 17.3 18.2 7 32 7z" />
  </svg>
);

const CameraIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke={C.cobre} strokeWidth="5">
    <rect x="8" y="8" width="48" height="48" rx="14" />
    <circle cx="32" cy="32" r="11" />
    <circle cx="46" cy="18" r="2.5" fill={C.cobre} stroke="none" />
  </svg>
);

const ContactRow: React.FC<{ icon: React.ReactNode; text: string; p: number; top: number }> = ({ icon, text, p, top }) => (
  <div
    style={{
      position: "absolute",
      left: PAD,
      top,
      display: "flex",
      alignItems: "center",
      gap: 28,
      opacity: p,
      transform: `translateY(${(1 - p) * 30}px)`,
    }}
  >
    {icon}
    <div style={{ fontFamily: FONT_TEXT, fontWeight: 600, fontSize: 64, lineHeight: 1, color: C.hueso }}>{text}</div>
  </div>
);

const CloseScene: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = T.close;
  const square = interpolate(f, [t0 + 4, t0 + 14], [0.6, 1], { ...clamp, easing: outEase });
  const squareIn = progress(f, t0 + 4, 6);
  const draw = progress(f, t0 + 12, 9, inOutEase);
  const dot = progress(f, t0 + 20, 6);
  const word = progress(f, t0 + 16, 12);
  return (
    <AbsoluteFill>
      <PhotoBg from={t0} dur={T.end - t0} stops={[[0, 0.94], [0.3, 0.88], [0.6, 0.9], [1, 0.97]]} />
      <div style={{ position: "absolute", left: PAD, top: 360, opacity: squareIn }}>
        <LogoLockup icon={150} word={124} gap={34} letterSpacing={-2} square={square} draw={draw} dot={dot} wordReveal={word} />
      </div>
      <Title
        id="eslogan"
        size={64}
        weight={800}
        letterSpacing={-1}
        revealFrom={t0 + 26}
        style={pos(570)}
        lines={[["Turnos que cortan ", acc("en seco.")]]}
      />
      <Title
        id="cta"
        size={128}
        revealFrom={t0 + 34}
        style={pos(880)}
        maxBottom={1180}
        lines={["Pedí tu", [acc("demo gratis.")]]}
      />
      <ContactRow icon={<ChatIcon />} text="+54 9 11 7821-1114" p={progress(f, t0 + 44, 12)} top={1230} />
      <ContactRow icon={<CameraIcon />} text="@filoapp.ar" p={progress(f, t0 + 48, 12)} top={1340} />
    </AbsoluteFill>
  );
};

// ---------- composición ----------

export const FiloReel: React.FC = () => (
  <AbsoluteFill style={{ background: C.carbon }}>
    <CutStack
      w={W}
      h={H}
      dur={CUT}
      blade={10}
      layers={[
        { from: T.hook, node: <HookScene /> },
        { from: T.web, node: <WebScene /> },
        { from: T.how, node: <HowScene /> },
        { from: T.admin, node: <AdminScene /> },
        { from: T.close, node: <CloseScene /> },
      ]}
    />
    <Html5Audio src={staticFile("music/filo-bed.m4a")} />
  </AbsoluteFill>
);
