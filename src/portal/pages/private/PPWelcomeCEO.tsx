"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { Field } from "@/portal/ui/Field";
import { Countdown } from "@/portal/ui/Countdown";
import { BadgeMark } from "@/portal/ui/BadgeMark";
import { Avatar } from "@/portal/ui/Avatar";
import { StepNav } from "@/portal/ui/StepNav";
import { DocuSignMark } from "@/portal/ui/DocuSignMark";
import { GuardianBadge } from "@/portal/ui/GuardianBadge";
import { BrandonSignature } from "@/portal/ui/BrandonSignature";
import { EXEC_SUMMARY, QA_PRIVATE } from "@/portal/data/content";
import { PRIVATE } from "@/portal/data/private-offering";
import { PPStep, PP_TOTAL } from "@/portal/ui/PPStep";
import { PHOTO_MAP, PHOTO_BRANDON } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";
import { achLabel, achErr } from "@/portal/data/ach-labels";

export function PPWelcomeCEO({ go, onBack }) {
  const [playing, setPlaying] = useState(false);

  const VideoBlock = () => {
    if (playing && CEO_VIDEO_URL && CEO_VIDEO_KIND === "mp4") {
      return (
        <video src={CEO_VIDEO_URL} controls autoPlay playsInline style={{
          width: "100%", aspectRatio: "4/3", borderRadius: 14, background: "#000",
          border: `1px solid ${C.line}`, display: "block" }} />
      );
    }
    if (playing && CEO_VIDEO_URL && CEO_VIDEO_KIND !== "mp4") {
      return (
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/3",
          borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line}` }}>
          <iframe src={CEO_VIDEO_URL + "?autoplay=1"} title="Brandon Beard — Music Habitat"
            allow="autoplay; fullscreen" frameBorder="0" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        </div>
      );
    }
    return (
      <div onClick={() => CEO_VIDEO_URL && setPlaying(true)} style={{
        position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 14,
        overflow: "hidden", border: `1px solid ${C.line}`, cursor: CEO_VIDEO_URL ? "pointer" : "default",
        background: "radial-gradient(circle at 50% 42%, #1c1c1c 0%, #0c0c0c 72%, #060606 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%",
          background: C.teal, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#04252A", fontSize: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>▶</div>
        <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 12,
          color: "#fff", background: "rgba(0,0,0,0.6)", padding: "2px 8px",
          borderRadius: 4, fontVariantNumeric: "tabular-nums" }}>03:00</span>
        {!CEO_VIDEO_URL && (
          <span style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10,
            color: C.textDim, letterSpacing: 1, textTransform: "uppercase",
            fontFamily: FONT_DISPLAY }}>Video coming soon</span>
        )}
      </div>
    );
  };

  return (
    <Shell onBack={onBack}>
      <PPStep step={1} />
      <div style={{ position: "relative" }}>
        {/* Subtle live-music imagery, dimmed behind a dark scrim — teal-tinted for the Private lane */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: "-16px -16px 0", zIndex: 0, pointerEvents: "none",
          borderRadius: 16, overflow: "hidden",
          background: "radial-gradient(120% 80% at 50% 0%, rgba(0,201,221,0.12) 0%, rgba(0,201,221,0.05) 40%, #000000 78%)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${WELCOME_BG})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.34,
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.62) 55%, rgba(0,0,0,0.85) 100%)",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, paddingTop: 14 }}>
          <Kicker color={C.teal}>The Private Offering · A Welcome</Kicker>

          {/* Top row: video player on the LEFT, name + title on the RIGHT */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 50%", maxWidth: "50%" }}>
              <VideoBlock />
            </div>
            <div style={{ flex: 1 }}>
              <H size={22} accent={C.text} style={{ lineHeight: 1.15, margin: 0 }}>
                Welcome From<br/>Brandon Beard
              </H>
              <div style={{ color: C.teal, fontSize: 11, letterSpacing: 1.5,
                textTransform: "uppercase", fontFamily: FONT_DISPLAY, marginTop: 6 }}>
                Founder · Chairman · CEO
              </div>
            </div>
          </div>

          {/* Second row: Brandon's photo on the LEFT, italic welcome letter + signature on the RIGHT */}
          <div style={{ display: "flex", gap: 16, alignItems: "stretch", marginTop: 20 }}>
            <div style={{ flex: "0 0 38%", maxWidth: "38%" }}>
              <img src={PHOTO_BRANDON} alt="Brandon Beard"
                onError={(e) => { e.target.style.display = "none"; }}
                style={{ width: "100%", height: "100%", minHeight: 220, objectFit: "cover",
                  objectPosition: "center 20%", borderRadius: 14, border: `1px solid ${C.line}`,
                  display: "block" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: C.textDim, fontSize: 13.5, lineHeight: 1.6, fontStyle: "italic",
                margin: 0 }}>
                Thank you for your interest in Music Habitat's Private Offering. We're building the
                operating system that will power the future of live music — for the artists,
                venues, and fans worldwide.
              </p>
              <p style={{ color: C.textDim, fontSize: 13.5, lineHeight: 1.6, fontStyle: "italic",
                margin: "12px 0 0" }}>
                This round invites accredited investors to own a direct stake in that mission. I'm
                grateful you're considering joining us, and I look forward to the conversation.
              </p>
              <BrandonSignature />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <Btn variant="teal" onClick={() => go("pp_overview")}>Continue</Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// =============================================================================
// PP2 — Private Offering Overview (the Private tab landing)
// =============================================================================
