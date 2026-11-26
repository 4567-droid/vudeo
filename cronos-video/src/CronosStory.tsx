import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Track, staticFile, useVideoConfig } from "remotion";
import "./fonts";
import { Flash } from "./components/Flash";
import { Legal } from "./components/Legal";
import { Shot } from "./components/Shot";
import { Cta, CtaBackground } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Price } from "./scenes/Plan";
import { Urgency } from "./scenes/Urgency";
import { C } from "./theme";

/**
 * Versión corta de 15 s para Stories: gancho + plan + cierre con WhatsApp.
 * Usa un subconjunto de las fotos, también en orden alfabético.
 * Si cambiás tiempos acá, actualizá los golpes en scripts/make_music.py.
 */
export const CronosStory: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Track name="Fotos">
        <Shot name="Foto 1000227059 (showroom)" from={0} durationInFrames={1.5 * fps} src="fotos/1000227059.jpg" aspect={4 / 3} x={[58, 50]} zoom={[1.22, 1.08]} dim={0.35} />
        <Shot name="Foto 1000227068 (frente 3/4)" from={1.5 * fps} durationInFrames={1.5 * fps} src="fotos/1000227068.jpg" x={[84, 66]} zoom={[1.06, 1.14]} dim={0.35} />
        <Shot name="Foto 1000227071 (lateral)" from={3 * fps} durationInFrames={3 * fps} src="fotos/1000227071.jpg" aspect={1920 / 1259} x={[10, 80]} zoom={[1.02, 1.02]} dim={0.6} />
        <Shot name="Foto 1000227073 (cola 3/4)" from={6 * fps} durationInFrames={3 * fps} src="fotos/1000227073.jpg" x={[78, 60]} dim={0.6} />
        <Shot name="Foto 1000227082 (tablero)" from={9 * fps} durationInFrames={2 * fps} src="fotos/1000227082.jpg" x={[40, 70]} zoom={[1.04, 1.1]} dim={0.5} />
        <CtaBackground name="Fondo cierre" from={11 * fps} durationInFrames={4 * fps} />
      </Track>

      <Track name="Destellos">
        <Flash name="Corte" from={1.5 * fps} intensity={0.35} />
        <Flash name="Drop (precio)" from={3 * fps} durationInFrames={9} intensity={1} />
        <Flash name="Corte" from={6 * fps} intensity={0.5} />
        <Flash name="Corte" from={9 * fps} intensity={0.5} />
        <Flash name="Corte cierre" from={11 * fps} intensity={0.9} />
      </Track>

      <Track name="Textos">
        <Hook name="Gancho" from={0} durationInFrames={3 * fps} />
        <Price name="Plan: anticipo" from={3 * fps} durationInFrames={3 * fps} label="ANTICIPO" value="$4.000.000" size={200} lineWidth={760} />
        <Price name="Plan: cuotas" from={6 * fps} durationInFrames={3 * fps} label="CUOTAS DESDE" value="$450.000" size={230} lineWidth={760} />
        <Urgency name="Entrega + consultá ya" from={9 * fps} durationInFrames={2 * fps} ctaAt={30} />
        <Cta name="Cierre WhatsApp" from={11 * fps} durationInFrames={4 * fps} />
      </Track>

      <Legal name="Texto legal" from={0} durationInFrames={15 * fps}>
        Sujeto a condiciones del plan. Cuota sujeta a actualización según valor del vehículo.
      </Legal>

      <Audio name="Música" src={staticFile("music/story.m4a")} />
    </AbsoluteFill>
  );
};
