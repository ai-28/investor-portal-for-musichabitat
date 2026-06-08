"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export function H({
  children,
  accent = C.text,
  size = 30,
  style = {},
}: {
  children: React.ReactNode;
  accent?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <h1 style={{
      fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 0.5, lineHeight: 1.05, fontSize: size, margin: "0 0 8px",
      color: accent, ...style,
    }}>{children}</h1>
  );
}

export function Kicker({ children, color = C.amber }) {
  return (
    <div style={{
      fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: 3,
      textTransform: "uppercase", fontSize: 11, color, marginBottom: 10,
    }}>{children}</div>
  );
}

// Amber = commit. Teal = explore. Ghost = secondary.
