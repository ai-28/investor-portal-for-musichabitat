"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell, TopBar } from "@/portal/ui/Shell";
import { Logo } from "@/portal/ui/Logo";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { Avatar } from "@/portal/ui/Avatar";

import { READER_CONTENT } from "@/portal/data/reader-content";
import { READER_PENDING } from "@/portal/data/reader-pending";
import { VERBATIM } from "@/portal/data/verbatim";
import { DOC_SOURCES } from "@/portal/data/doc-config";
import { resolveDocKey } from "@/portal/data/doc-aliases";
import { downloadReaderDoc } from "@/portal/lib/pdf";

export function InPortalDocReader({ docId, onBack }) {
  const key = resolveDocKey(docId);
  const V = VERBATIM[key];
  const D = READER_CONTENT[key];

  if (!V && !D) {
    return (
      <Shell onBack={onBack}>
        <div style={{ paddingTop: 60, textAlign: "center" }}>
          <div style={{ fontSize: 34 }}>📄</div>
          <H size={22}>Document</H>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 8 }}>
            This document isn't available to read in-portal yet.
          </p>
          <Btn variant="ghost" onClick={onBack}>Back</Btn>
        </div>
      </Shell>
    );
  }

  // ---- VERBATIM render (full article text) ----------------------------------
  if (V) {
    return (
      <Shell onBack={onBack}>
        <div style={{ paddingTop: 16 }}>
          <Kicker>{V.kicker}</Kicker>
          <H size={25}>{V.title}</H>
        </div>
        {V.meta && (
          <Card style={{ padding: "6px 16px", marginTop: 8 }}>
            {V.meta.map(([k, v], i, arr) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between",
                padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none",
                fontSize: 13 }}>
                <span style={{ color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5,
                  fontSize: 11, fontFamily: FONT_DISPLAY }}>{k}</span>
                <span style={{ color: C.text, textAlign: "right", maxWidth: "62%" }}>{v}</span>
              </div>
            ))}
          </Card>
        )}
        {V.articles.map(([h, ...paras], i) => (
          <div key={i} style={{ marginTop: 18 }}>
            <div style={{ color: C.teal, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13,
              letterSpacing: 0.5, marginBottom: 8, paddingBottom: 6,
              borderBottom: `1px solid ${C.line}` }}>{h}</div>
            {paras.map((p, j) => {
              const isWaiver = /KNOWINGLY|WAIVE|JURY TRIAL/.test(p) && p === p.toUpperCase();
              return (
                <p key={j} style={{ fontSize: 13, lineHeight: 1.6,
                  color: isWaiver ? C.amber : C.textDim,
                  background: isWaiver ? C.amberDim : "transparent",
                  border: isWaiver ? `1px solid ${C.amber}55` : "none",
                  borderRadius: isWaiver ? 8 : 0, padding: isWaiver ? "10px 12px" : 0,
                  margin: "0 0 9px", fontWeight: isWaiver ? 600 : 400 }}>{p}</p>
              );
            })}
          </div>
        ))}
        <p style={{ color: C.textFaint, fontSize: 10, lineHeight: 1.5, marginTop: 22,
          paddingTop: 14, borderTop: `1px solid ${C.line}` }}>{V.note}</p>
        <div style={{ marginTop: 14 }}>
          <Btn variant="amber" onClick={() => downloadReaderDoc(docId)}>Download PDF</Btn>
          <Btn variant="ghost" onClick={onBack}>Back to Documents</Btn>
        </div>
      </Shell>
    );
  }

  // ---- READER_CONTENT render (structured summary) ---------------------------
  return (
    <Shell onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <Kicker>{D.kicker}</Kicker>
        <H size={26}>{D.title}</H>
        <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>{D.intro}</p>
      </div>

      {/* Team roster → photo avatars (item 3). Roster rows: [name, role, img]. */}
      {D.roster && (
        <Card style={{ padding: "6px 16px", marginTop: 8 }}>
          {D.roster.map(([name, role, img], i, arr) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
              <Avatar name={name} img={img} size={38} flat />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase",
                  letterSpacing: 0.5, marginTop: 2 }}>{role}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {(D.sections || []).map((s, i) => (
        <div key={i} style={{ marginTop: 18 }}>
          <div style={{ color: C.teal, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13,
            letterSpacing: 0.5, marginBottom: 8 }}>{s.h}</div>
          {s.body && <p style={{ fontSize: 13, lineHeight: 1.6, color: C.textDim, margin: 0 }}>{s.body}</p>}
          {s.list && s.list.map(([t, d], j) => (
            <div key={j} style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <span style={{ color: C.amber, fontSize: 13, flexShrink: 0, paddingTop: 1 }}>▸</span>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t}</span>
                <span style={{ fontSize: 13, color: C.textDim }}> — {d}</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {D.financials && (
        <div style={{ marginTop: 20 }}>
          <div style={{ color: C.teal, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13,
            letterSpacing: 0.5, marginBottom: 8 }}>{D.financials.heading}</div>
          <Card style={{ padding: "4px 12px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>{D.financials.cols.map((c, i) => (
                  <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 6px",
                    color: C.textFaint, fontFamily: FONT_DISPLAY, fontSize: 10, letterSpacing: 1,
                    textTransform: "uppercase", borderBottom: `1px solid ${C.lineHi}` }}>{c}</th>
                ))}</tr>
              </thead>
              <tbody>
                {D.financials.rows.map((r, i) => (
                  <tr key={i}>{r.map((c, j) => (
                    <td key={j} style={{ textAlign: j === 0 ? "left" : "right", padding: "8px 6px",
                      color: j === 0 ? C.textDim : C.text, borderBottom: `1px solid ${C.line}`,
                      fontWeight: j === 0 ? 400 : 600 }}>{c}</td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {D.ask && (
        <div style={{ marginTop: 20 }}>
          <div style={{ color: C.amber, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13,
            letterSpacing: 0.5, marginBottom: 8 }}>{D.ask.heading}</div>
          <Card style={{ padding: "4px 16px" }}>
            {D.ask.items.map(([label, amt, pct], i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "10px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
                <span style={{ fontSize: 13, color: C.text }}>{label}</span>
                <span style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.amber }}>{amt}</span>
                  <span style={{ fontSize: 11, color: C.textFaint, minWidth: 32,
                    textAlign: "right" }}>{pct}</span>
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {D.note && (
        <p style={{ color: C.textFaint, fontSize: 10, lineHeight: 1.5, marginTop: 22,
          paddingTop: 14, borderTop: `1px solid ${C.line}` }}>{D.note}</p>
      )}

      <div style={{ marginTop: 14 }}>
        {/* Company-info readers are view-only; investor docs + plans offer download. */}
        {["deck", "services", "team"].includes(key) ? null : (
          <Btn variant="amber" onClick={() => downloadReaderDoc(docId)}>Download PDF</Btn>
        )}
        <Btn variant="ghost" onClick={onBack}>Back to Documents</Btn>
      </div>
    </Shell>
  );
}

// Map the Document Center's several ids to canonical reader/source keys.
