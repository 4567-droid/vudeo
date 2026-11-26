import React from "react";
import { Box, Layer, Rise, Slam } from "../components/anim";
import { C, DISPLAY, SANS, SHADOW } from "../theme";
import type { Timed } from "./Hook";

const big = (fontSize: number): React.CSSProperties => ({
  fontFamily: DISPLAY,
  fontSize,
  lineHeight: 1.08,
  color: C.white,
  textShadow: SHADOW,
});

/** 12-16 s: "No necesitás tener todo el dinero junto." */
export const NoNecesitas: React.FC<Timed> = (t) => (
  <Layer {...t}>
    <Slam at={0}>
      <Box bg={C.white} color={C.black} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64 }}>
        NO NECESITÁS
      </Box>
    </Slam>
    <Slam at={8} style={{ marginTop: 18 }}>
      <div style={big(168)}>TENER TODO</div>
    </Slam>
    <Slam at={15}>
      <div style={big(168)}>EL DINERO</div>
    </Slam>
    <Slam at={23} shake={26} style={{ marginTop: 8 }}>
      <Box bg={C.red} color={C.white} style={{ fontFamily: DISPLAY, fontSize: 230, lineHeight: 1.1 }}>
        JUNTO
      </Box>
    </Slam>
  </Layer>
);

/** 16-18 s: el plan de ahorro como el camino fácil. */
export const PlanFacil: React.FC<Timed> = (t) => (
  <Layer {...t}>
    <Slam at={0}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 62, color: C.white, textShadow: SHADOW }}>
        CON EL
      </div>
    </Slam>
    <Slam at={5}>
      <div style={big(200)}>PLAN DE</div>
    </Slam>
    <Slam at={10} shake={22}>
      <Box bg={C.red} color={C.white} style={{ fontFamily: DISPLAY, fontSize: 210, lineHeight: 1.1 }}>
        AHORRO
      </Box>
    </Slam>
    <Rise at={20} style={{ marginTop: 30 }}>
      <Box bg={C.white} color={C.black} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 50 }}>
        EL CAMINO FÁCIL A TU 0KM
      </Box>
    </Rise>
  </Layer>
);

const Step: React.FC<{ readonly n: string; readonly at: number; readonly hot?: boolean; readonly children: React.ReactNode }> = ({
  n,
  at,
  hot,
  children,
}) => (
  <Rise at={at} style={{ display: "flex", alignItems: "center", gap: 28 }}>
    <div
      style={{
        width: 124,
        height: 124,
        borderRadius: 62,
        backgroundColor: C.red,
        color: C.white,
        fontFamily: DISPLAY,
        fontSize: 82,
        lineHeight: "124px",
        textAlign: "center",
        boxShadow: "0 12px 34px rgba(0,0,0,0.5)",
      }}
    >
      {n}
    </div>
    <Box
      bg={hot ? C.red : C.white}
      color={hot ? C.white : C.black}
      style={{ fontFamily: DISPLAY, fontSize: 86, lineHeight: 1.18 }}
    >
      {children}
    </Box>
  </Rise>
);

/** 18-22 s: los tres pasos del plan, uno por tiempo musical. */
export const Steps: React.FC<Timed> = (t) => (
  <Layer {...t}>
    <Slam at={0}>
      <div style={big(130)}>ASÍ DE FÁCIL</div>
    </Slam>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 34, marginTop: 44 }}>
      <Step n="1" at={10}>
        ANTICIPO
      </Step>
      <Step n="2" at={25}>
        CUOTAS MENSUALES
      </Step>
      <Step n="3" at={40} hot>
        TU CRONOS 0KM
      </Step>
    </div>
  </Layer>
);
