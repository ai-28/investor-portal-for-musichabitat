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
import { askAssistant } from "@/portal/lib/assistant";
import { AssistantSources } from "@/portal/ui/AssistantSources";
import { AssistantMessageBody } from "@/portal/ui/AssistantMessageBody";

export function Page6({ go, onBack }) {
  const cats = Object.keys(QA);
  const [cat, setCat] = useState(cats[0]);
  const [open, setOpen] = useState(null);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [chat, busy]);

  const ask = async (preset) => {
    const q = (typeof preset === "string" ? preset : input).trim();
    if (!q || busy) return;
    setInput("");
    const next = [...chat, { role: "user", content: q }];
    setChat(next);
    setBusy(true);
    try {
      const { text, sources } = await askAssistant(
        "ff",
        next.map((m) => ({ role: m.role, content: m.content })),
      );
      setChat((c) => [...c, { role: "assistant", content: text, sources }]);
    } catch (e) {
      setChat((c) => [...c, { role: "assistant", content: "Something went wrong reaching the assistant. Please try again in a moment, or email brandon@musichabitat.com." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell step={6} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
        <Kicker>Get Your Questions Answered</Kicker>
        <H size={26}>Q&amp;A</H>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 8 }}>
        {cats.map((c) => (
          <button key={c} onClick={() => { setCat(c); setOpen(null); }} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer",
            fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase",
            background: cat === c ? C.amber : C.card, color: cat === c ? "#1A1206" : C.textDim,
            border: `1px solid ${cat === c ? C.amber : C.line}`, fontWeight: 600,
          }}>{c}</button>
        ))}
      </div>

      <Card style={{ padding: "2px 16px" }}>
        {QA[cat].map((item, i) => (
          <div key={i} style={{ borderBottom: i < QA[cat].length - 1 ? `1px solid ${C.line}` : "none" }}>
            <div onClick={() => setOpen(open === i ? null : i)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "14px 0", cursor: "pointer" }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: C.text }}>{item.q}</span>
              <span style={{ color: C.amber, fontSize: 18, transform: open === i ? "rotate(45deg)" : "none",
                transition: "transform .2s" }}>+</span>
            </div>
            {open === i && (
              <p style={{ fontSize: 13, lineHeight: 1.6, color: C.textDim, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{item.a}</p>
            )}
          </div>
        ))}
      </Card>

      {/* AI assistant */}
      <Kicker color={C.teal}>Ask the Investor Assistant</Kicker>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div ref={scroller} style={{ maxHeight: 300, overflowY: "auto", padding: 16 }}>
          {chat.length === 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.tealDim}, ${C.amberDim})`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💬</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Music Habitat Investor Assistant</div>
                  <div style={{ fontSize: 11, color: C.textFaint }}>Ask anything about the company or the investment</div>
                </div>
              </div>
              <p style={{ color: C.textDim, fontSize: 12.5, lineHeight: 1.5, margin: "0 0 12px" }}>
                I can explain the SAFE, the warrant, the share classes, the market, the team, or the
                terms of the Circle 35 — in plain language. Tap a question to start, or type your own.
                Answers are informational only — not legal, tax, or investment advice.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  "How does the SAFE convert to equity?",
                  "What does my warrant actually get me?",
                  "What's the difference between the share classes?",
                  "Walk me through the $250K round.",
                  "What happens if I invest $5,000?",
                  "Why should I believe the market is this big?",
                ].map((sq) => (
                  <button key={sq} onClick={() => ask(sq)} style={{
                    padding: "9px 12px", borderRadius: 18, cursor: "pointer", textAlign: "left",
                    background: C.card, color: C.text, border: `1px solid ${C.teal}55`,
                    fontSize: 12.5, lineHeight: 1.3, fontFamily: FONT_BODY }}>
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chat.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10 }}>
              <div style={{ maxWidth: "82%", padding: "10px 13px", borderRadius: 12, fontSize: 13,
                lineHeight: 1.5, whiteSpace: "pre-wrap",
                background: m.role === "user" ? C.amber : C.cardHi,
                color: m.role === "user" ? "#1A1206" : C.text,
                border: m.role === "user" ? "none" : `1px solid ${C.line}` }}>
                {m.role === "user" ? m.content : <AssistantMessageBody text={m.content} />}
                {m.role === "assistant" && m.sources?.length > 0 && (
                  <AssistantSources sources={m.sources} accent={C.teal} />
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 13px", borderRadius: 12, background: C.cardHi,
                border: `1px solid ${C.line}`, color: C.textFaint, fontSize: 13 }}>Thinking…</div>
            </div>
          )}
          {chat.length > 0 && !busy && chat[chat.length - 1].role === "assistant" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
              {[
                "Tell me more about the risks.",
                "How do I actually invest?",
                "What are the Guardian perks?",
              ].map((fq) => (
                <button key={fq} onClick={() => ask(fq)} style={{
                  padding: "7px 11px", borderRadius: 16, cursor: "pointer",
                  background: "transparent", color: C.teal, border: `1px solid ${C.teal}55`,
                  fontSize: 12, fontFamily: FONT_BODY }}>
                  {fq}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${C.line}` }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
            placeholder="Type your question…"
            style={{ flex: 1, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10,
              padding: "11px 13px", color: C.text, fontSize: 14, outline: "none", fontFamily: FONT_BODY }} />
          <button onClick={() => ask()} disabled={busy} style={{ padding: "0 18px", borderRadius: 10,
            background: C.amber, color: "#1A1206", border: "none", fontWeight: 700, fontSize: 14,
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: FONT_DISPLAY }}>
            Send
          </button>
        </div>
      </Card>

      <Btn variant="amber" onClick={() => go("page7")}>Continue to Application</Btn>
    </Shell>
  );
}

// =============================================================================
// PAGE 7 — Investment Application
// =============================================================================
