"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export const PP_TOTAL = 11;


export function PPStep({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 14 }}>
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 10, letterSpacing: 1,
        textTransform: "uppercase", color: C.textFaint }}>Step {step} / {PP_TOTAL}</span>
      <div style={{ flex: 1, height: 3, background: C.cardHi, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${(step / PP_TOTAL) * 100}%`, height: "100%", background: C.teal }} />
      </div>
    </div>
  );
}

// =============================================================================
// PP1 — CEO Welcome (Private · tweaked from the F&F welcome — no Circle 35 framing)
// =============================================================================
