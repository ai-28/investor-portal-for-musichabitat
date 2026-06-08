"use client";

import { C, FONT_DISPLAY } from "@/portal/tokens";

export function StepNav({ step }: { step?: number }) {
  const TOTAL = 13;
  if (!step) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: C.textFaint,
        }}
      >
        Step {step} / {TOTAL}
      </span>
      <div
        style={{
          flex: 1,
          height: 3,
          background: C.cardHi,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(step / TOTAL) * 100}%`,
            height: "100%",
            background: C.amber,
          }}
        />
      </div>
    </div>
  );
}
