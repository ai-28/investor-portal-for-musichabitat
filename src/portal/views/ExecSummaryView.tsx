"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell, TopBar } from "@/portal/ui/Shell";
import { Logo } from "@/portal/ui/Logo";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { Avatar } from "@/portal/ui/Avatar";

import { EXEC_SUMMARY } from "@/portal/data/content";
import { downloadExecSummaryPDF } from "@/portal/lib/pdf";

export function ExecSummaryView({ onBack }) {
  const E = EXEC_SUMMARY;
  const Section = ({ n, kicker, children }) => (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        <span style={{ color: C.teal, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 12 }}>{n}</span>
        <span style={{ color: C.teal, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 11,
          letterSpacing: 2, textTransform: "uppercase" }}>{kicker}</span>
      </div>
      {children}
    </div>
  );
  const maxRev = 35;
  return (
    <Shell onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <div style={{ paddingBottom: 18, marginBottom: 4, borderBottom: `1px solid ${C.line}` }}>
          <Logo size={30} center />
        </div>
        <div style={{ fontSize: 10, color: C.textFaint, letterSpacing: 2,
          textTransform: "uppercase", fontFamily: FONT_DISPLAY }}>
          Executive Summary · F&F · May 2026
        </div>
        <H size={28} accent={C.text} style={{ marginTop: 10 }}>{E.headline}</H>
        <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>{E.intro}</p>
      </div>

      <Section n="01" kicker="The Problem">
        <p style={{ fontStyle: "italic", color: C.text, fontSize: 16, margin: "0 0 12px" }}>{E.problem.title}</p>
        {E.problem.items.map(([t, d], i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{t}</div>
            <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.55, margin: "3px 0 0" }}>{d}</p>
          </div>
        ))}
      </Section>

      <Section n="02" kicker="The Platform">
        <p style={{ fontStyle: "italic", color: C.text, fontSize: 16, margin: "0 0 12px" }}>{E.platform.title}</p>
        {E.platform.services.map(([name, desc], i) => (
          <Card key={i} style={{ marginBottom: 10, padding: 14 }}>
            <div style={{ color: C.teal, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{name}</div>
            <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{desc}</p>
          </Card>
        ))}
      </Section>

      <Section n="03" kicker="Market Opportunity">
        {E.market.map(([k, v, d, color]) => (
          <Card key={k} style={{ marginBottom: 10, padding: 14, borderLeft: `3px solid ${color}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ color: C.textFaint, fontFamily: FONT_DISPLAY, fontSize: 11,
                letterSpacing: 1.5 }}>{k}</span>
              <span style={{ color, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24 }}>{v}</span>
            </div>
            <p style={{ color: C.textDim, fontSize: 12, margin: "4px 0 0" }}>{d}</p>
          </Card>
        ))}
      </Section>

      <Section n="04" kicker="Business Model">
        <p style={{ fontStyle: "italic", color: C.text, fontSize: 16, margin: "0 0 12px" }}>{E.businessModel.title}</p>
        {E.businessModel.streams.map(([t, d], i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <span style={{ color: C.amber, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, textTransform: "uppercase",
                letterSpacing: 0.5 }}>{t}</div>
              <p style={{ color: C.textDim, fontSize: 13, margin: "2px 0 0", lineHeight: 1.5 }}>{d}</p>
            </div>
          </div>
        ))}
      </Section>

      <Section n="05" kicker="Go-to-Market">
        <p style={{ fontStyle: "italic", color: C.text, fontSize: 16, margin: "0 0 12px" }}>{E.gtm.title}</p>
        {E.gtm.phases.map(([p, d], i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0",
            borderBottom: `1px solid ${C.line}` }}>
            <span style={{ color: C.amber, fontFamily: FONT_DISPLAY, fontSize: 11,
              letterSpacing: 1, textTransform: "uppercase", minWidth: 64 }}>{p}</span>
            <span style={{ color: C.textDim, fontSize: 13, lineHeight: 1.5 }}>{d}</span>
          </div>
        ))}
      </Section>

      <Section n="06" kicker="Financial Trajectory">
        <p style={{ fontStyle: "italic", color: C.text, fontSize: 16, margin: "0 0 12px" }}>{E.trajectory.title}</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 120,
          padding: "0 8px", marginBottom: 12 }}>
          {E.trajectory.revenue.map(([y, v]) => (
            <div key={y} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ color: C.amber, fontFamily: FONT_DISPLAY, fontWeight: 700,
                fontSize: 14, marginBottom: 4 }}>${v}M</div>
              <div style={{ height: (v / maxRev) * 90, background: `linear-gradient(${C.teal}, ${C.amber})`,
                borderRadius: "4px 4px 0 0" }} />
              <div style={{ color: C.textFaint, fontSize: 10, marginTop: 6,
                textTransform: "uppercase", letterSpacing: 1, fontFamily: FONT_DISPLAY }}>{y}</div>
            </div>
          ))}
        </div>
        <Card style={{ padding: "4px 14px" }}>
          {E.trajectory.metrics.map(([m, ...vals]) => (
            <div key={m} style={{ display: "flex", justifyContent: "space-between",
              padding: "8px 0", borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>
              <span style={{ color: C.textDim }}>{m}</span>
              <span style={{ display: "flex", gap: 18 }}>
                {vals.map((v, i) => <span key={i} style={{ color: i === 2 ? C.amber : C.text,
                  minWidth: 40, textAlign: "right" }}>{v}</span>)}
              </span>
            </div>
          ))}
        </Card>
        <p style={{ color: C.textFaint, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
          <strong>Assumptions · </strong>{E.trajectory.note}
        </p>
      </Section>

      <Section n="07" kicker="Use of Proceeds">
        <p style={{ fontStyle: "italic", color: C.text, fontSize: 16, margin: "0 0 12px" }}>{E.proceeds.title}</p>
        {E.proceeds.items.map(([label, pct, color]) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13,
              marginBottom: 4 }}>
              <span style={{ color: C.text }}>{label}</span>
              <span style={{ color, fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: C.cardHi, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color }} />
            </div>
          </div>
        ))}
      </Section>

      <Section n="08" kicker="Leadership">
        {E.leadership.map(([name, role, img, link, linkType]) => {
          const isWebsite = linkType === "website";
          const label = isWebsite ? `${name}'s website` : `${name} on LinkedIn`;
          return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 12,
            padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
            <Avatar name={name} img={img} size={36} flat />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase",
                letterSpacing: 0.5 }}>{role}</div>
            </div>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer"
                aria-label={label} title={label}
                style={{ flexShrink: 0, display: "inline-flex", alignItems: "center",
                  justifyContent: "center", width: 30, height: 30, borderRadius: 7,
                  background: isWebsite ? C.amber : "#0A66C2",
                  color: isWebsite ? "#1A1206" : "#fff", textDecoration: "none" }}>
                {isWebsite ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                    aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.97 0 1.78-.77 1.78-1.73V1.73C24 .77 23.19 0 22.22 0z"/>
                  </svg>
                )}
              </a>
            )}
          </div>
          );
        })}
      </Section>

      <p style={{ color: C.textFaint, fontSize: 10, lineHeight: 1.5, marginTop: 24,
        paddingTop: 14, borderTop: `1px solid ${C.line}` }}>{E.disclaimer}</p>

      <div style={{ marginTop: 16 }}>
        <Btn variant="amber" onClick={downloadExecSummaryPDF}>Download PDF</Btn>
        <Btn variant="ghost" onClick={onBack}>Back</Btn>
      </div>
    </Shell>
  );
}

// Functional download. Production: if a hosted PDF URL is set, open it directly.
// Otherwise generate a clean PDF in-browser from the Executive Summary content.
