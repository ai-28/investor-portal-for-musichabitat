"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell, TopBar } from "@/portal/ui/Shell";
import { Logo } from "@/portal/ui/Logo";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";

import { PROTOTYPE_IMAGES, PROTOTYPE_LIVE_URL } from "@/portal/data/doc-config";

export function PrototypeView({ onBack }) {
  const [idx, setIdx] = useState(0);
  const imgs = PROTOTYPE_IMAGES;
  const total = imgs.length;
  const go = (d) => setIdx((p) => (p + d + total) % total);
  const REQUEST_EMAIL = "brandon@musichabitat.com";

  return (
    <Shell onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <Kicker>See It In Motion</Kicker>
        <H size={26}>Prototype View</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          A first look at the Music Habitat mobile experience.
        </p>
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        {/* Phone frame */}
        <div style={{ width: 230, aspectRatio: "9/19.5", background: "#000",
          border: `2px solid ${C.lineHi}`, borderRadius: 30, padding: 8, position: "relative",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 22, overflow: "hidden",
            background: C.cardHi, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {imgs[idx] ? (
              <img src={imgs[idx]} alt={`Prototype ${idx + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📱</div>
                <div style={{ color: C.textFaint, fontSize: 11, letterSpacing: 1,
                  textTransform: "uppercase", fontFamily: FONT_DISPLAY }}>
                  App Visual {idx + 1}
                </div>
                <div style={{ color: C.textFaint, fontSize: 10, marginTop: 6 }}>
                  {/* BACKEND HOOK: PROTOTYPE_IMAGES[{idx}] */}
                  Coming soon
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button onClick={() => go(-1)} style={navArrow("left")}>‹</button>
            <button onClick={() => go(1)} style={navArrow("right")}>›</button>
          </>
        )}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 16 }}>
          {imgs.map((_, i) => (
            <span key={i} onClick={() => setIdx(i)} style={{ width: 8, height: 8, borderRadius: "50%",
              background: i === idx ? C.amber : C.lineHi, cursor: "pointer", transition: "all .2s" }} />
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        {PROTOTYPE_LIVE_URL ? (
          <Btn variant="amber" onClick={() => window.open(PROTOTYPE_LIVE_URL, "_blank")}>
            Open Live Prototype
          </Btn>
        ) : null}
        <Btn variant={PROTOTYPE_LIVE_URL ? "ghost" : "amber"}
          onClick={() => { window.location.href =
            `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent("Prototype access request — The Circle 35")}`; }}>
          Request Prototype Access
        </Btn>
        <Btn variant="ghost" onClick={onBack}>Back to Documents</Btn>
      </div>
    </Shell>
  );
}
export function navArrow(side) {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    [side]: -4, width: 40, height: 40, borderRadius: "50%",
    background: "rgba(20,20,20,0.9)", border: `1px solid ${C.lineHi}`,
    color: C.text, fontSize: 22, cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 2,
  };
}

// =============================================================================
// DocViewer — routes a docId to the correct renderer.
// =============================================================================
