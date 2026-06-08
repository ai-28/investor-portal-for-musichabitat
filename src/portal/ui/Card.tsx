"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export function Card({
  children,
  style,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  accent?: string;
}) {
  return (
    <div onClick={onClick} style={{
      background: C.card, border: `1px solid ${C.line}`,
      borderTop: accent ? `2px solid ${accent}` : `1px solid ${C.line}`,
      borderRadius: 12, padding: 18, marginBottom: 14,
      cursor: onClick ? "pointer" : "default", ...style,
    }}>{children}</div>
  );
}
