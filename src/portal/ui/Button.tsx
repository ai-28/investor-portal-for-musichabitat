"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export function Btn({
  children,
  onClick,
  variant = "amber",
  full = true,
  disabled = false,
  style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  full?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const styles = {
    amber: { bg: C.amber, fg: "#1A1206", border: "none" },
    teal: { bg: "transparent", fg: C.teal, border: `1px solid ${C.tealDim}` },
    ghost: { bg: "transparent", fg: C.textDim, border: `1px solid ${C.line}` },
  }[variant ?? "amber"];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: full ? "100%" : "auto",
        padding: "15px 22px",
        background: disabled ? C.cardHi : styles.bg,
        color: disabled ? C.textFaint : styles.fg,
        border: styles.border,
        borderRadius: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: "uppercase",
        transition: "opacity .15s",
        marginTop: 4,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
