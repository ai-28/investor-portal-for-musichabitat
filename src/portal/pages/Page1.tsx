"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { Logo } from "@/portal/ui/Logo";
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
import { EXEC_SUMMARY, REFERRERS, DOC_CENTER, QA } from "@/portal/data/content";
import { PHOTO_MAP, BRANDON_PHOTO } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";
import { achLabel, achErr } from "@/portal/data/ach-labels";

export function Page1({ go, openExecSummary }) {
  const tiles = [
    { key: "ff", icon: "👥", title: "Friends & Family", sub: "$500 – $25,000",
      tag: "Exclusive Access", term: "Jul 1 – Sep 30, 2026", accent: C.amber,
      action: () => go("gate_ff") },
    { key: "private", icon: "🏛", title: "Private Offering", sub: "Accredited Investors · Reg D 506(c) · min $2,500",
      tag: "Accredited Access", term: "Priced Class B", accent: C.teal,
      action: () => go("gate_private") },
  ];
  return (
    <Shell>
      <div style={{ paddingTop: 8 }}><Logo size={30} center /></div>
      <div style={{ textAlign: "center", margin: "26px 0 8px" }}>
        <H size={32}>Welcome to the<br/>Music Habitat<br/>Investor Portal</H>
        <p style={{ color: C.textDim, fontSize: 15, lineHeight: 1.5, margin: "10px 0 0" }}>
          Invest in the future of live music.
        </p>
        <p style={{ color: C.textFaint, fontSize: 13, lineHeight: 1.5, margin: "6px 0 0" }}>
          Select the investment opportunity that best fits your investor profile.
        </p>
      </div>

      <div className="portal-home-tiles" style={{ marginTop: 24 }}>
        {tiles.map((t) => (
          <Card key={t.key} accent={t.accent} onClick={t.action} style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
              <div style={{ fontSize: 26, width: 40, textAlign: "center" }}>{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17,
                  textTransform: "uppercase", letterSpacing: 0.5 }}>{t.title}</div>
                <div style={{ color: C.textDim, fontSize: 12, marginTop: 3 }}>{t.sub}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                    color: t.tagColor || t.accent,
                    border: `1px solid ${(t.tagColor || t.accent)}55`, borderRadius: 20,
                    padding: "3px 9px", fontFamily: FONT_DISPLAY }}>{t.tag}</span>
                  <span style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                    color: C.textFaint, padding: "3px 0", fontFamily: FONT_DISPLAY }}>{t.term}</span>
                </div>
              </div>
              <div style={{ color: t.accent, fontSize: 22 }}>›</div>
            </div>

            {/* F&F-only: countdown clock + Learn more + badge */}
            {t.key === "ff" && (
              <div style={{ borderTop: `1px solid ${C.line}`, padding: "12px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <Countdown target="2026-09-30T23:59:59" />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.amber, textTransform: "uppercase",
                    letterSpacing: 0.5, fontFamily: FONT_DISPLAY, textAlign: "right",
                    lineHeight: 1.2 }}>Learn more about<br/>The Circle 35</span>
                  <BadgeMark size={34} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <Btn variant="teal" onClick={openExecSummary}>View Executive Summary</Btn>
      </div>
    </Shell>
  );
}

// ---- Login gate stub (shared by F&F and Private) ----------------------------
