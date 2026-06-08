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
import { EXEC_SUMMARY, REFERRERS, DOC_CENTER, QA } from "@/portal/data/content";
import { PHOTO_MAP, BRANDON_PHOTO } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";
import { achLabel, achErr } from "@/portal/data/ach-labels";

export function Page4({ go, onBack }) {
  const [perksOpen, setPerksOpen] = useState(false);
  const RAISED = 2000, GOAL = 250000;       // 2 investors × $1,000 = $2,000 seeded
  const pct = Math.round((RAISED / GOAL) * 100);
  const stats = [
    { icon: "💳", label: "Investment Range", val: "$500 – $25,000" },
    { icon: "🎯", label: "Target Raise", val: "$250,000" },
    { icon: "📜", label: "Structure", val: "SAFE + Warrant" },
    { icon: "👥", label: "Maximum Investors", val: "35" },
  ];
  // Proposed tiered perks. Base perks (all Guardians) appear on every tier;
  // higher commitments layer on premium access. Top tier adds the metal wallet badge.
  // All perks are membership benefits subject to terms — not investment returns.
  const PERK_TIERS = [
    {
      band: "$500 – $2,500", name: "Guardian",
      perks: [
        "Serialized Guardian Badge (№ I–XXXV) — digital, high-res PNG, and foil-stamped print",
        "Permanent VIP designation on your platform profile",
        "Guaranteed presale access for any StageBid show in your city",
        "Quarterly information rights (unaudited financials)",
        "3× warrant coverage at 95% of FMV",
        "Music Habitat merch — Welcome Kit: enamel pin, sticker set, and a Circle 35 tee",
      ],
    },
    {
      band: "$5,000 – $15,000", name: "Founding Guardian",
      perks: [
        "Everything in the Guardian tier",
        "Founder's Lounge — quarterly virtual gatherings with Brandon & rotating artists",
        "Annual Guardians Dinner invitation (in person)",
        "Priority presale windows ahead of general Guardians",
        "Music Habitat merch — Founder's Box: premium hoodie, embroidered cap, tote, and vinyl-style notebook",
      ],
    },
    {
      band: "$25,000", name: "Cornerstone Guardian",
      metal: true,
      perks: [
        "Everything in the Founding Guardian tier",
        "A real metal Guardian Badge in your wallet — present it at any Music Habitat event for complimentary entry + VIP for two (some restrictions apply)",
        "Direct text-line access to the founder",
        "First call on founding-circle opportunities, every time",
        "Music Habitat merch — Cornerstone Collection: full apparel set, limited-edition numbered jacket, and a framed Circle 35 print",
      ],
    },
  ];
  return (
    <Shell step={4} onBack={onBack}>
      <div style={{ paddingTop: 18, textAlign: "center" }}>
        <H size={30} accent={C.amber}>The Circle 35</H>
        <div style={{ color: C.textDim, fontSize: 13, letterSpacing: 1.5,
          textTransform: "uppercase", fontFamily: FONT_DISPLAY }}>
          Founding Investor Program
        </div>
      </div>

      {/* What the Circle 35 is — context drawn from the F&F Raise Package */}
      <Card style={{ marginTop: 20, borderLeft: `3px solid ${C.amber}` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <GuardianBadge size={96} serial="XVII" />
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: C.text, margin: 0 }}>
          The Circle 35 is a closed group of <strong style={{ color: C.amber }}>thirty-five
          founding investors</strong> — no more. Not a marketing list, not numbers on a deck.
          These are the people who believe in Music Habitat early, when belief means the most.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: C.textDim, margin: "12px 0 0" }}>
          We chose thirty-five because anything larger stops being friends and family — it stops
          being the people who knew us before there was a company to know. Each Guardian's name is
          inscribed on one of the first thirty-five serialized Guardian Badges, № I through № XXXV.
        </p>
      </Card>

      {/* What you become */}
      <Kicker color={C.teal}>What You Become</Kicker>
      <Card style={{ padding: "6px 18px" }}>
        {[
          ["🛡", "A Guardian of the Stage", "A permanent, serialized place in Music Habitat's founding capital structure — paired forever with your badge perks and stock certificate, and 1 of only 35 to carry this distinction on their profile page."],
          ["🎟", "Presale & VIP access", "Guaranteed presale access for any show in your city, and a permanent VIP designation on your platform profile."],
          ["🥂", "The Founder's Lounge", "Quarterly virtual gatherings with Brandon and rotating artists — plus a standing invitation to the annual Guardians Dinner."],
          ["📞", "A direct line", "Direct access to the founder for the matters that warrant it. The door of Music Habitat never closes for the Circle 35."],
        ].map(([icon, title, desc], i, arr) => (
          <div key={title} style={{ display: "flex", gap: 12, padding: "13px 0",
            borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: C.textDim, margin: "3px 0 0" }}>{desc}</p>
            </div>
          </div>
        ))}
      </Card>

      {/* The journey in brief */}
      <Kicker color={C.teal}>The Path to Guardian · ~2 Weeks</Kicker>
      <Card style={{ padding: "16px 18px" }}>
        {[
          ["Step 1", "Introduction, the offering package, and a direct Q&A with leadership.", "Day 0–2", false],
          ["Step 2", "Your counsel reviews the documents; you sign the Subscription and Stock Purchase agreements.", "Day 2–7", false],
          ["Step 3", "Funding by voice-verified wire, then close — your Class B Preferred shares are issued.", "Day 7–10", false],
          ["Step 4", "Your serialized Guardian Badge is issued. Welcome to the Circle 35.", "Day 10–14", true],
        ].map(([step, desc, days, showBadge], i, arr) => (
          <div key={step}>
            <div style={{ display: "flex", gap: 12,
              alignItems: showBadge ? "center" : "flex-start" }}>
              <span style={{ color: C.amber, fontFamily: FONT_DISPLAY, fontSize: 11,
                letterSpacing: 1, textTransform: "uppercase", minWidth: 50, paddingTop: 2 }}>{step}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: C.textDim, margin: 0 }}>{desc}</p>
                <span style={{ fontSize: 10, color: C.textFaint, textTransform: "uppercase",
                  letterSpacing: 1, fontFamily: FONT_DISPLAY }}>{days}</span>
              </div>
              {showBadge && (
                <div style={{ flexShrink: 0 }}>
                  <GuardianBadge size={64} serial="XVII" />
                </div>
              )}
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 18,
                margin: "8px 0" }}>
                <span style={{ color: C.amber, fontSize: 18, lineHeight: 1 }}>↓</span>
              </div>
            )}
          </div>
        ))}
      </Card>

      {/* Investor Perks — tappable, reveals tiered perks */}
      <Card onClick={() => setPerksOpen((o) => !o)} style={{
        display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
        borderLeft: `3px solid ${C.amber}`, marginBottom: perksOpen ? 0 : 14,
      }}>
        <span style={{ fontSize: 22 }}>🎖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16,
            textTransform: "uppercase", letterSpacing: 0.5 }}>Investor Perks</div>
          <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>
            What you unlock at each investment level.
          </div>
        </div>
        <span style={{ color: C.amber, fontSize: 22, transform: perksOpen ? "rotate(90deg)" : "none",
          transition: "transform .2s" }}>›</span>
      </Card>

      {perksOpen && (
        <div style={{ marginBottom: 14 }}>
          {PERK_TIERS.map((tier) => (
            <Card key={tier.name} style={{
              marginBottom: 10, borderTop: `2px solid ${tier.metal ? C.amber : C.line}`,
            }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15,
                  textTransform: "uppercase", letterSpacing: 0.5,
                  color: tier.metal ? C.amber : C.text }}>{tier.name}</span>
                <span style={{ fontSize: 12, color: C.textDim, fontFamily: FONT_DISPLAY }}>{tier.band}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                {tier.perks.map((p, i) => {
                  const isMetal = tier.metal && i === 1;
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8,
                      alignItems: "flex-start" }}>
                      <span style={{ color: isMetal ? C.amber : C.teal, fontSize: 13,
                        flexShrink: 0, paddingTop: 1 }}>{isMetal ? "🏅" : "✓"}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.5,
                        color: isMetal ? C.text : C.textDim,
                        fontWeight: isMetal ? 600 : 400 }}>{p}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
          <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, margin: "2px 4px 0" }}>
            Perks are membership benefits of the Circle 35, subject to terms, and are not investment
            returns. Event access subject to availability and restrictions.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 22 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ textAlign: "center", marginBottom: 0 }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 10, color: C.textFaint, margin: "8px 0 4px",
              textTransform: "uppercase", letterSpacing: 1, fontFamily: FONT_DISPLAY }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.amber }}>{s.val}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: C.amber }}>
            ${RAISED.toLocaleString()}
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase",
          letterSpacing: 1, fontFamily: FONT_DISPLAY }}>Raised</div>
        <div style={{ height: 8, background: C.cardHi, borderRadius: 5, marginTop: 12,
          overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: C.amber }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8,
          fontSize: 11, color: C.textFaint }}>
          <span>2 of 35 positions reserved</span>
          <span>${GOAL.toLocaleString()} goal</span>
        </div>
      </Card>

      <Card style={{ textAlign: "center", borderColor: C.lineHi }}>
        <p style={{ fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: C.text, margin: 0 }}>
          "Join us as we build the future operating system for the live music industry."
        </p>
        <div style={{ color: C.amber, fontSize: 12, marginTop: 10, fontFamily: FONT_DISPLAY,
          letterSpacing: 1, textTransform: "uppercase" }}>— Brandon Beard, CEO</div>
      </Card>

      <Btn variant="amber" onClick={() => go("page5")}>Continue</Btn>
    </Shell>
  );
}

// =============================================================================
// PAGE 5 — Investor Document Center (read-tracking checkmarks)
// =============================================================================
