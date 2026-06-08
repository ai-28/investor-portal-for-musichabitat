"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export function BrandonSignature() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("gf-signature")) return;
    const link = document.createElement("link");
    link.id = "gf-signature";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Homemade+Apple&family=Mr+Dafoe&family=Sacramento&display=swap";
    document.head.appendChild(link);
  }, []);
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{
        fontFamily: '"Homemade Apple", "Mr Dafoe", "Sacramento", "Snell Roundhand", "Segoe Script", "Brush Script MT", cursive',
        fontSize: 26, lineHeight: 1.1, color: C.text, transform: "rotate(-3deg)",
        transformOrigin: "left center", display: "inline-block", fontWeight: 400,
        letterSpacing: 0.5,
      }}>
        Brandon Beard
      </div>
      <div style={{ width: 150, height: 1, background: C.line, margin: "12px 0 0" }} />
      <div style={{ fontSize: 10, color: C.textFaint, letterSpacing: 1.5,
        textTransform: "uppercase", fontFamily: FONT_DISPLAY, marginTop: 5 }}>
        Brandon Beard · Founder &amp; CEO
      </div>
    </div>
  );
}
