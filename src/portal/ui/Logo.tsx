"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export const MH_LOGO_URL = "";

export function Logo({ size = 28, center }) {
  const h = Math.round(size * 1.05);
  const wrap = {
    display: "flex", alignItems: "center", gap: Math.round(size * 0.32),
    justifyContent: center ? "center" : "flex-start", width: center ? "100%" : "auto",
  };
  // Hosted asset override.
  if (MH_LOGO_URL) {
    return (
      <div style={wrap}>
        <img src={MH_LOGO_URL} alt="Music Habitat" height={h}
          style={{ height: h, width: "auto", display: "block" }} />
      </div>
    );
  }
  // Inline SVG: teal equalizer mark with an amber "habitat" arch + MUSIC HABITAT wordmark.
  const m = Math.round(size * 1.15); // mark square
  return (
    <div style={wrap}>
      <svg width={m} height={m} viewBox="0 0 32 32" aria-label="Music Habitat" role="img"
        style={{ display: "block", flexShrink: 0 }}>
        <rect x="4"  y="11" width="3" height="10" rx="1.5" fill={C.teal} />
        <rect x="9"  y="7"  width="3" height="18" rx="1.5" fill={C.teal} />
        <path d="M14 25 V13 a2.4 2.4 0 0 1 4.8 0 V25" fill="none" stroke={C.amber}
          strokeWidth="3" strokeLinecap="round" />
        <rect x="20" y="7"  width="3" height="18" rx="1.5" fill={C.teal} />
        <rect x="25" y="11" width="3" height="10" rx="1.5" fill={C.teal} />
      </svg>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800,
        fontSize: Math.round(size * 0.62), letterSpacing: 1.5, lineHeight: 1,
        whiteSpace: "nowrap" }}>
        <span style={{ color: C.teal }}>MUSIC</span>
        <span style={{ color: C.amber }}> HABITAT</span>
      </span>
    </div>
  );
}
