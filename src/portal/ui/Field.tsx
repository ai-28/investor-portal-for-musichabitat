"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ fontSize: 11, letterSpacing: 1.5, color: C.textDim,
        textTransform: "uppercase", fontFamily: FONT_DISPLAY }}>{label}</span>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)} style={{
          width: "100%", marginTop: 6, padding: "13px 14px", background: C.cardHi,
          border: `1px solid ${C.line}`, borderRadius: 9, color: C.text,
          fontSize: 15, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box",
        }} />
    </label>
  );
}

// Live countdown to the offering close (Sept 30, 2026).
