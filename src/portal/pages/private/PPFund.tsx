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
import { PHOTO_MAP, BRANDON_PHOTO } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";
import { achLabel, achErr } from "@/portal/data/ach-labels";

export function PPFund({ go, onBack, papp }) {
  const [method, setMethod] = useState("wire");
  const amt = Number(papp.amount || PRIVATE.minInvestment);
  const [ach, setAch] = useState({
    holder: papp.fullName || "", acctType: "checking",
    routing: "", account: "", confirm: "", authorized: false,
  });
  const setA = (k) => (v) => setAch((s) => ({ ...s, [k]: v }));
  const routingValid = /^\d{9}$/.test(ach.routing);
  const accountValid = /^\d{4,17}$/.test(ach.account);
  const confirmMatch = ach.account.length > 0 && ach.account === ach.confirm;
  const achComplete = ach.holder.trim() && routingValid && accountValid && confirmMatch && ach.authorized;
  const [achSubmitted, setAchSubmitted] = useState(false);
  const submitAch = () => {
    if (!achComplete) return;
    // BACKEND HOOK: tokenize + authorize via FUNDING.achProcessorEndpoint.
    setAchSubmitted(true);
  };
  const methods = [
    { id: "wire", icon: "🏦", label: "Wire Transfer", sub: "Voice-verified · same-day" },
    { id: "ach", icon: "💳", label: "ACH Transfer", sub: "1–3 business days" },
    { id: "check", icon: "✉️", label: "Certified Check", sub: "By mail" },
  ];

  const fld = (label, value, onChange, props = {}) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, color: C.textFaint, textTransform: "uppercase",
        letterSpacing: 1, fontFamily: FONT_DISPLAY, marginBottom: 6 }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} {...props}
        style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 10,
          padding: "13px 14px", color: C.text, fontSize: 15, outline: "none",
          fontFamily: FONT_BODY, boxSizing: "border-box" }} />
    </div>
  );

  return (
    <Shell onBack={onBack}>
      <PPStep step={9} />
      <div style={{ paddingTop: 12 }}>
        <Kicker color={C.teal}>Final Step</Kicker>
        <H size={26}>Fund Your Investment</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          Funding ${amt.toLocaleString()} for your {PRIVATE.shareClass} purchase.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {methods.map((m) => (
          <Card key={m.id} onClick={() => setMethod(m.id)} style={{ flex: 1, textAlign: "center",
            cursor: "pointer", marginBottom: 0, borderColor: method === m.id ? C.teal : C.line }}>
            <div style={{ fontSize: 22 }}>{m.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6,
              color: method === m.id ? C.teal : C.text }}>{m.label}</div>
            <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {method === "wire" && (
        <Card style={{ padding: "4px 16px" }}>
          {/* BACKEND HOOK: deliver real wire details out-of-band, voice-verified. */}
          {[
            ["Beneficiary", FUNDING.beneficiary],
            ["Bank", FUNDING.bankName],
            ["Routing", FUNDING.routing],
            ["Account", FUNDING.account],
            ["Amount", `$${amt.toLocaleString()}`],
          ].map(([k, v], i, arr) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14,
              padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none",
              fontSize: 13 }}>
              <span style={{ color: C.textFaint }}>{k}</span>
              <span style={{ color: C.text, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </Card>
      )}

      {method === "wire" && (
        <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, margin: "10px 4px 0" }}>
          For security, final wire instructions are confirmed by phone before you send funds. Never
          wire to details received only by email.
        </p>
      )}

      {method === "ach" && !achSubmitted && (
        <div>
          {fld("Account holder name", ach.holder, setA("holder"), { placeholder: "Jane Q. Investor" })}
          {fld("Routing number", ach.routing, (v) => setA("routing")(v.replace(/[^0-9]/g, "")),
            { inputMode: "numeric", placeholder: "9 digits" })}
          {fld("Account number", ach.account, (v) => setA("account")(v.replace(/[^0-9]/g, "")),
            { inputMode: "numeric", placeholder: "Account number" })}
          {fld("Confirm account number", ach.confirm, (v) => setA("confirm")(v.replace(/[^0-9]/g, "")),
            { inputMode: "numeric", placeholder: "Re-enter account number" })}
          {ach.confirm && !confirmMatch && (
            <p style={{ fontSize: 11, color: C.red, margin: "-6px 4px 10px" }}>Account numbers do not match.</p>
          )}
          <Card onClick={() => setA("authorized")(!ach.authorized)} style={{ display: "flex", gap: 12,
            cursor: "pointer", alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
              border: `1px solid ${ach.authorized ? C.green : C.lineHi}`,
              background: ach.authorized ? C.green : "transparent", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000" }}>
              {ach.authorized ? "✓" : ""}
            </div>
            <span style={{ fontSize: 12.5, lineHeight: 1.5, color: C.textDim }}>
              I authorize Music Habitat, Inc. to initiate a one-time ACH debit of ${amt.toLocaleString()}
              {" "}from the account above for my Class B Preferred purchase.
            </span>
          </Card>
          <Btn variant="teal" onClick={submitAch} style={{ opacity: achComplete ? 1 : 0.5 }}>
            Authorize ACH Debit
          </Btn>
          <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, margin: "8px 4px 0" }}>
            {/* BACKEND HOOK: tokenize via FUNDING.achProcessorEndpoint (Plaid/Stripe). */}
            Bank details are tokenized by a secure processor. Music Habitat never stores your raw
            account number.
          </p>
        </div>
      )}

      {method === "ach" && achSubmitted && (
        <Card style={{ borderColor: C.green, textAlign: "center" }}>
          <div style={{ fontSize: 28 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.green, marginTop: 6 }}>
            ACH authorization received
          </div>
          <p style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.5, margin: "6px 0 0" }}>
            Your debit will process in 1–3 business days. You'll receive confirmation by email.
          </p>
        </Card>
      )}

      {method === "check" && (
        <Card style={{ padding: "4px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.teal, marginBottom: 10 }}>
            Mail a Certified Check
          </div>
          {[["Payable to", FUNDING.checkPayee], ["Mail to", FUNDING.checkAddress],
            ["Amount", `$${amt.toLocaleString()}`]].map(([k, v], i, arr) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14,
              padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none",
              fontSize: 13 }}>
              <span style={{ color: C.textFaint }}>{k}</span>
              <span style={{ color: C.text, textAlign: "right", maxWidth: "60%" }}>{v}</span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, margin: "10px 0 2px" }}>
            Make the check payable as shown. Your position is confirmed once the check clears and
            the Company accepts your subscription.
          </p>
        </Card>
      )}

      <Btn variant="teal"
        onClick={() => (method === "wire" || method === "check" || achSubmitted) && go("pp_welcome")}
        style={{ opacity: (method === "wire" || method === "check" || achSubmitted) ? 1 : 0.5, marginTop: 14 }}>
        {method === "ach" ? "Complete" : "I've Initiated Funding"}
      </Btn>
    </Shell>
  );
}

// =============================================================================
// PP8 — Welcome / Confirmation (priced Class B — General certificate)
// =============================================================================
