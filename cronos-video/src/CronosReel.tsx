import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Track, staticFile, useVideoConfig } from "remotion";
import "./fonts";
import { Flash } from "./components/Flash";
import { Legal } from "./components/Legal";
import { Shot } from "./components/Shot";
import { Caption } from "./scenes/Caption";
import { Cta, CtaBackground } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Price, Recap } from "./scenes/Plan";
import { NoNecesitas, PlanFacil, Steps } from "./scenes/Solution";
import { Urgency } from "./scenes/Urgency";
import { C } from "./theme";

/**
 * Reel de 40 s (1080x1920, 30 fps). Música a 120 BPM: cada corte cae en un beat.
 * Las fotos van en orden alfabético de archivo (public/fotos).
 * Si cambiás tiempos acá, actualizá los golpes en scripts/make_music.py.
 */
export const CronosReel: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Track name="Fotos">
        <Shot name="Foto 1000227059 (showroom)" from={0} durationInFrames={1.5 * fps} src="fotos/1000227059.jpg" aspect={4 / 3} x={[58, 50]} zoom={[1.22, 1.08]} dim={0.35} />
        <Shot name="Foto 1000227068 (frente 3/4)" from={1.5 * fps} durationInFrames={1.5 * fps} src="fotos/1000227068.jpg" x={[84, 66]} zoom={[1.06, 1.14]} dim={0.35} />
        <Shot name="Foto 1000227069 (cola)" from={3 * fps} durationInFrames={2 * fps} src="fotos/1000227069.jpg" fit={1700} zoom={[1.0, 1.08]} dim={0.1} />
        <Shot name="Foto 1000227070 (frente)" from={5 * fps} durationInFrames={2 * fps} src="fotos/1000227070.jpg" fit={1700} zoom={[1.1, 1.0]} dim={0.1} />
        <Shot name="Foto 1000227071 (lateral)" from={7 * fps} durationInFrames={2.5 * fps} src="fotos/1000227071.jpg" aspect={1920 / 1259} x={[8, 92]} zoom={[1.02, 1.02]} dim={0.1} />
        <Shot name="Foto 1000227072 (llanta)" from={9.5 * fps} durationInFrames={2.5 * fps} src="fotos/1000227072.jpg" x={[52, 52]} zoom={[1.08, 1.26]} dim={0.12} />
        <Shot name="Foto 1000227073 (cola 3/4)" from={12 * fps} durationInFrames={2 * fps} src="fotos/1000227073.jpg" x={[78, 62]} dim={0.5} />
        <Shot name="Foto 1000227074 (emblema Cronos)" from={14 * fps} durationInFrames={2 * fps} src="fotos/1000227074.jpg" fit={1700} drift={[-30, -70]} dim={0.5} />
        <Shot name="Foto 1000227075 (emblema Precision)" from={16 * fps} durationInFrames={2 * fps} src="fotos/1000227075.jpg" x={[38, 42]} dim={0.55} />
        <Shot name="Foto 1000227076 (parrilla)" from={18 * fps} durationInFrames={2 * fps} src="fotos/1000227076.jpg" x={[30, 38]} dim={0.6} />
        <Shot name="Foto 1000227077 (motor)" from={20 * fps} durationInFrames={2 * fps} src="fotos/1000227077.jpg" x={[46, 52]} zoom={[1.05, 1.2]} dim={0.6} />
        <Shot name="Foto 1000227078 (vano motor)" from={22 * fps} durationInFrames={2.5 * fps} src="fotos/1000227078.jpg" x={[50, 50]} zoom={[1.15, 1.04]} dim={0.62} />
        <Shot name="Foto 1000227079 (asientos traseros)" from={24.5 * fps} durationInFrames={2.5 * fps} src="fotos/1000227079.jpg" x={[10, 26]} dim={0.62} />
        <Shot name="Foto 1000227080 (apoyabrazos)" from={27 * fps} durationInFrames={2.5 * fps} src="fotos/1000227080.jpg" x={[30, 42]} dim={0.62} />
        <Shot name="Foto 1000227081 (tapizado)" from={29.5 * fps} durationInFrames={2.5 * fps} src="fotos/1000227081.jpg" x={[84, 76]} dim={0.62} />
        <Shot name="Foto 1000227082 (tablero)" from={32 * fps} durationInFrames={4 * fps} src="fotos/1000227082.jpg" x={[40, 86]} zoom={[1.04, 1.1]} dim={0.5} />
        <CtaBackground name="Fondo cierre" from={36 * fps} durationInFrames={4 * fps} />
      </Track>

      <Track name="Destellos">
        <Flash name="Corte" from={1.5 * fps} intensity={0.35} />
        <Flash name="Corte sección" from={3 * fps} intensity={0.8} />
        <Flash name="Corte" from={5 * fps} intensity={0.3} />
        <Flash name="Corte" from={7 * fps} intensity={0.3} />
        <Flash name="Corte" from={9.5 * fps} intensity={0.3} />
        <Flash name="Corte sección" from={12 * fps} intensity={0.8} />
        <Flash name="Corte" from={14 * fps} intensity={0.3} />
        <Flash name="Corte" from={16 * fps} intensity={0.3} />
        <Flash name="Corte" from={18 * fps} intensity={0.3} />
        <Flash name="Corte" from={20 * fps} intensity={0.3} />
        <Flash name="Drop (precio)" from={22 * fps} durationInFrames={9} intensity={1} />
        <Flash name="Corte" from={24.5 * fps} intensity={0.25} />
        <Flash name="Corte" from={27 * fps} intensity={0.25} />
        <Flash name="Corte" from={29.5 * fps} intensity={0.25} />
        <Flash name="Corte sección" from={32 * fps} intensity={0.8} />
        <Flash name="Corte cierre" from={36 * fps} intensity={0.9} />
      </Track>

      <Track name="Textos">
        <Hook name="Gancho" from={0} durationInFrames={3 * fps} />
        <Caption name="Auto: cola" from={3 * fps} durationInFrames={2 * fps} kicker="DISEÑO" big="QUE ENAMORA" />
        <Caption name="Auto: frente" from={5 * fps} durationInFrames={2 * fps} kicker="PRESENCIA" big="QUE SE NOTA" />
        <Caption name="Auto: lateral" from={7 * fps} durationInFrames={2.5 * fps} kicker="ESPACIO" big="PARA TODOS" />
        <Caption name="Auto: llanta" from={9.5 * fps} durationInFrames={2.5 * fps} kicker="CADA DETALLE" big="CUENTA" />
        <NoNecesitas name="Solución: no necesitás" from={12 * fps} durationInFrames={4 * fps} />
        <PlanFacil name="Solución: plan de ahorro" from={16 * fps} durationInFrames={2 * fps} />
        <Steps name="Solución: pasos" from={18 * fps} durationInFrames={4 * fps} />
        <Price name="Plan: anticipo" from={22 * fps} durationInFrames={4 * fps} label="ANTICIPO" value="$4.000.000" size={200} lineWidth={760} />
        <Price name="Plan: cuotas" from={26 * fps} durationInFrames={4 * fps} label="CUOTAS DESDE" value="$450.000" size={230} lineWidth={760} />
        <Recap name="Plan: resumen" from={30 * fps} durationInFrames={2 * fps} />
        <Urgency name="Urgencia" from={32 * fps} durationInFrames={4 * fps} />
        <Cta name="Cierre WhatsApp" from={36 * fps} durationInFrames={4 * fps} />
      </Track>

      <Legal name="Texto legal" from={0} durationInFrames={40 * fps}>
        Sujeto a condiciones del plan. Cuota sujeta a actualización según valor del vehículo.
      </Legal>

      <Audio name="Música" src={staticFile("music/reel.m4a")} />
    </AbsoluteFill>
  );
};
