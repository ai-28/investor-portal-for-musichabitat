"use client";

import { C, FONT_BODY, FONT_DISPLAY } from "@/portal/tokens";
import { Logo } from "@/portal/ui/Logo";

export function Shell({
  children,
  step,
  total = 14,
  onBack,
}: {
  children: React.ReactNode;
  step?: number;
  total?: number;
  onBack?: () => void;
}) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: FONT_BODY, maxWidth: 440, margin: "0 auto",
      position: "relative", overflowX: "hidden",
    }}>
      <TopBar step={step} total={total} onBack={onBack} />
      <div style={{ padding: "0 20px 120px" }}>{children}</div>
    </div>
  );
}


export function TopBar({
  step,
  total,
  onBack,
}: {
  step?: number;
  total?: number;
  onBack?: () => void;
}) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 30, background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}`,
      padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
    }}>
      {onBack ? (
        <button onClick={onBack} style={{
          background: "none", border: "none", color: C.textDim, fontSize: 22,
          cursor: "pointer", lineHeight: 1, padding: 0, width: 24,
        }}>‹</button>
      ) : <div style={{ width: 24 }} />}
      <Logo size={22} />
      {step ? (
        <span style={{ marginLeft: "auto", fontSize: 11, letterSpacing: 1.5,
          color: C.textFaint, fontFamily: FONT_DISPLAY, textTransform: "uppercase" }}>
          Step {step} / {total}
        </span>
      ) : null}
    </div>
  );
}

// BACKEND HOOK: set MH_LOGO_URL to a hosted PNG/SVG (e.g.
// "https://www.musichabitat.com/logo.svg") to override the inline mark below.
// When set, the Logo component renders the hosted image; otherwise the
// dependency-free inline SVG renders (crisp at any size, never 404s).
