"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY } from "@/portal/tokens";

type CountdownParts = { d: number; h: number; m: number; s: number };

function calcRemaining(target: string): CountdownParts | null {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return null;
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  };
}

function Seg({ v, l }: { v: number; l: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 30 }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 16,
          color: C.amber,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(v).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: 8,
          color: C.textFaint,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontFamily: FONT_DISPLAY,
        }}
      >
        {l}
      </div>
    </div>
  );
}

export function Countdown({ target = "2026-09-30T23:59:59" }) {
  // Defer live clock to client only — avoids SSR/client second mismatch.
  const [t, setT] = useState<CountdownParts | null | undefined>(undefined);

  useEffect(() => {
    const tick = () => setT(calcRemaining(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t === undefined) {
    return (
      <div>
        <div
          style={{
            fontSize: 9,
            color: C.textFaint,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            fontFamily: FONT_DISPLAY,
            marginBottom: 4,
          }}
        >
          Offering closes in
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            opacity: 0.4,
            fontFamily: FONT_DISPLAY,
            fontSize: 16,
            color: C.amber,
          }}
        >
          -- : -- : -- : --
        </div>
      </div>
    );
  }

  if (!t) {
    return (
      <span
        style={{
          fontSize: 11,
          color: C.textFaint,
          fontFamily: FONT_DISPLAY,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Offering closed
      </span>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: 9,
          color: C.textFaint,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: FONT_DISPLAY,
          marginBottom: 4,
        }}
      >
        Offering closes in
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Seg v={t.d} l="Days" />
        <span style={{ color: C.amberDim }}>:</span>
        <Seg v={t.h} l="Hrs" />
        <span style={{ color: C.amberDim }}>:</span>
        <Seg v={t.m} l="Min" />
        <span style={{ color: C.amberDim }}>:</span>
        <Seg v={t.s} l="Sec" />
      </div>
    </div>
  );
}
