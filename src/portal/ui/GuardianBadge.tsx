"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export function GuardianBadge({ size = 96, serial = "XVII" }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none" aria-label="Guardian Badge">
      <defs>
        <linearGradient id="gbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4D77A" />
          <stop offset="0.5" stopColor="#C9A84C" />
          <stop offset="1" stopColor="#8C6F2E" />
        </linearGradient>
        <radialGradient id="gsheen" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF7DD" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="#F4D77A" stopOpacity="0.2" />
          <stop offset="1" stopColor="#8C6F2E" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* shield */}
      <path d="M60 8 L104 22 V58 C104 86 84 104 60 113 C36 104 16 86 16 58 V22 Z"
        fill="url(#gbg)" stroke="#6E561F" strokeWidth="2" />
      <path d="M60 8 L104 22 V58 C104 86 84 104 60 113 C36 104 16 86 16 58 V22 Z"
        fill="url(#gsheen)" />
      {/* inner ring */}
      <circle cx="60" cy="54" r="30" fill="none" stroke="#6E561F" strokeWidth="1.5" opacity="0.6" />
      {/* star */}
      <path d="M60 34 l6.5 13.5 14.8 2.1 -10.7 10.4 2.5 14.7 -13.1 -6.9 -13.1 6.9 2.5 -14.7 -10.7 -10.4 14.8 -2.1 Z"
        fill="#4A3A14" opacity="0.85" />
      {/* serial */}
      <text x="60" y="98" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11"
        fontWeight="700" fill="#4A3A14">№ {serial}</text>
    </svg>
  );
}

export function Page12({ go, onBack, app }) {
  return (
    <Shell step={12} onBack={onBack}>
      <div style={{ paddingTop: 30, textAlign: "center" }}>
        <GuardianBadge size={120} serial="XVII" />
        <Kicker color={C.amber}>Welcome to the Circle</Kicker>
        <H size={30} accent={C.amber}>You're In.</H>
        <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, margin: "12px 0 0" }}>
          {app.fullName ? `${app.fullName}, you` : "You"} are now a Guardian of the Stage — one of
          the founding 35. Your serialized badge has been reserved, and the founder will be in
          touch personally.
        </p>
      </div>

      {/* Stock certificate visual — Class B Preferred · Guardian */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 11, color: C.textFaint, letterSpacing: 1.5,
          textTransform: "uppercase", fontFamily: FONT_DISPLAY, textAlign: "center",
          marginBottom: 10 }}>
          Your Stock Certificate
        </div>
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}`,
          background: "#FBFAF6" }}>
          <img src={STOCK_CERT_IMG} alt="Music Habitat Class B Preferred Stock Certificate — Guardians of the Stage"
            style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, textAlign: "center",
          marginTop: 8 }}>
          Issued upon close. Final share count, certificate number, and issue date are
          completed when your subscription is accepted.
        </div>
      </div>

      <Card style={{ marginTop: 26, textAlign: "left", padding: "6px 16px" }}>
        {[
          ["Guardian designation", "Reserved · finalizing on close"],
          ["Your position", `$${Number(app.amount || 1000).toLocaleString()} · SAFE → Class B`],
          ["Badge serial", "Assigned at close"],
          ["What's next", "Founder welcome + close confirmation"],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12,
            padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none",
            fontSize: 13 }}>
            <span style={{ color: C.textFaint }}>{k}</span>
            <span style={{ color: C.text, textAlign: "right", maxWidth: "60%" }}>{v}</span>
          </div>
        ))}
      </Card>

      <Btn variant="amber" onClick={() => go("page13")}>Next</Btn>
      <Btn variant="ghost" onClick={() => go("page1")}>Back to Portal Home</Btn>
    </Shell>
  );
}

// =============================================================================
// PAGE 13 — Schedule the founder call (Calendly hook)
// =============================================================================
// BACKEND HOOK: set to the founder's scheduling link (Calendly/Savvycal/etc.)
const CALENDLY_URL = ""; // e.g. "https://calendly.com/brandon-musichabitat/circle35"

export function Page13({ go, onBack, app }) {
  const openCalendly = () => {
    if (CALENDLY_URL) {
      window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
    } else {
      // BACKEND HOOK: set CALENDLY_URL above; until then, fall back to email.
      window.location.href =
        `mailto:brandon@musichabitat.com?subject=${encodeURIComponent("Circle 35 founder call — " + (app.fullName || "Guardian"))}`;
    }
  };
  return (
    <Shell step={13} onBack={onBack}>
      <div style={{ paddingTop: 24, textAlign: "center" }}>
        <div style={{ fontSize: 38 }}>📞</div>
        <Kicker color={C.teal}>One Last Thing</Kicker>
        <H size={28}>Talk With Brandon</H>
        <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6, margin: "10px 0 0" }}>
          Every Guardian gets a personal call with the founder. If you'd like one, schedule a
          time that works for you — or skip for now and book it later.
        </p>
      </div>

      <Card style={{ marginTop: 22, textAlign: "center", padding: "26px 20px" }}>
        <div style={{ fontSize: 26, marginBottom: 12 }}>🗓</div>
        <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6, margin: "0 0 18px" }}>
          Tap below to open Brandon's calendar and pick a time. It opens in a new tab so you
          won't lose your place here.
        </p>
        <Btn variant="amber" onClick={openCalendly}>Schedule With Brandon</Btn>
      </Card>

      <Btn variant="ghost" onClick={() => go("page1")}>Skip for Now</Btn>
    </Shell>
  );
}

// =============================================================================
// StepNav — compact progress indicator used across the flow pages
// =============================================================================
