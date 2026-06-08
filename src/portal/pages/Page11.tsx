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

import { usePortal } from "@/portal/PortalProvider";

export function Page11({ go, onBack, app }) {
  const { recordPaymentStatus } = usePortal();
  const [method, setMethod] = useState("wire");
  const amt = Number(app.amount || 1000);
  // ACH form state — investor's own bank details for an ACH debit (pull).
  const [ach, setAch] = useState({
    holder: app.fullName || "", acctType: "checking",
    routing: "", account: "", confirm: "", authorized: false,
  });
  const setA = (k) => (v) => setAch((s) => ({ ...s, [k]: v }));
  const routingValid = /^\d{9}$/.test(ach.routing);
  const accountValid = /^\d{4,17}$/.test(ach.account);
  const confirmMatch = ach.account.length > 0 && ach.account === ach.confirm;
  const achComplete = ach.holder.trim() && routingValid && accountValid && confirmMatch && ach.authorized;
  const [achSubmitted, setAchSubmitted] = useState(false);

  const submitAch = async () => {
    if (!achComplete) return;
    // BACKEND HOOK: tokenize + authorize via FUNDING.achProcessorEndpoint.
    // Do NOT send raw account numbers to a non-PCI/NACHA-compliant endpoint.
    await recordPaymentStatus("authorized");
    setAchSubmitted(true);
  };
  const methods = [
    { id: "wire", icon: "🏦", label: "Wire Transfer", sub: "Voice-verified · same-day" },
    { id: "ach", icon: "💳", label: "ACH Transfer", sub: FUNDING.achEnabled ? "1–3 business days" : "Coming soon" },
    { id: "check", icon: "✉️", label: "Certified Check", sub: "By mail" },
  ];
  return (
    <Shell step={11} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
        <Kicker>Final Step</Kicker>
        <H size={26}>Fund Your Investment</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          Funding <strong style={{ color: C.amber }}>${amt.toLocaleString()}</strong> to complete your subscription.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {methods.map((m) => {
          const disabled = m.id === "ach" && !FUNDING.achEnabled;
          const active = method === m.id;
          return (
            <button key={m.id} onClick={() => !disabled && setMethod(m.id)} style={{
              flex: 1, padding: "14px 6px", borderRadius: 12, cursor: disabled ? "default" : "pointer",
              background: active ? C.cardHi : C.card, border: `1px solid ${active ? C.amber : C.line}`,
              opacity: disabled ? 0.45 : 1, textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>{m.sub}</div>
            </button>
          );
        })}
      </div>

      <Card>
        {method === "wire" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.amber, marginBottom: 10 }}>
              Wire Instructions
            </div>
            {[["Beneficiary", FUNDING.beneficiary], ["Bank", FUNDING.bankName],
              ["Routing", FUNDING.routing], ["Account", FUNDING.account],
              ["Amount", `$${amt.toLocaleString()}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
                borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>
                <span style={{ color: C.textFaint }}>{k}</span>
                <span style={{ color: C.text }}>{v}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, marginTop: 12 }}>
              {/* BACKEND HOOK: deliver real wire details out-of-band, voice-verified. */}
              For your security, final wire details are confirmed by phone before you send funds.
              Never wire based on emailed instructions alone.
            </p>
          </div>
        )}
        {method === "ach" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.amber, marginBottom: 4 }}>
              ACH Bank Transfer
            </div>
            <p style={{ fontSize: 12, color: C.textFaint, lineHeight: 1.5, margin: "0 0 14px" }}>
              Enter the bank account you'd like to debit ${amt.toLocaleString()} from. Funds typically
              settle in 1–3 business days.
            </p>

            {achSubmitted ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>
                  Bank details received
                </div>
                <p style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.5, margin: "8px 0 0" }}>
                  We'll initiate a secure ACH debit of ${amt.toLocaleString()} from your{" "}
                  {ach.acctType} account ending in {ach.account.slice(-4)}. You'll receive a
                  confirmation once the transfer is authorized.
                </p>
                <button onClick={() => setAchSubmitted(false)} style={{
                  marginTop: 14, background: "none", border: `1px solid ${C.line}`, color: C.textDim,
                  borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer",
                  fontFamily: FONT_BODY }}>Edit details</button>
              </div>
            ) : (
              <div>
                {/* Account holder */}
                <div style={{ marginBottom: 12 }}>
                  <label style={achLabel}>Account holder name</label>
                  <input value={ach.holder} onChange={(e) => setA("holder")(e.target.value)}
                    placeholder="Full name on the account" style={achInput(true)} />
                </div>

                {/* Account type */}
                <div style={{ marginBottom: 12 }}>
                  <label style={achLabel}>Account type</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["checking", "savings"].map((t) => (
                      <button key={t} onClick={() => setA("acctType")(t)} style={{
                        flex: 1, padding: "11px 0", borderRadius: 10, cursor: "pointer",
                        textTransform: "capitalize", fontSize: 13, fontFamily: FONT_BODY,
                        background: ach.acctType === t ? C.cardHi : C.bg,
                        color: ach.acctType === t ? C.text : C.textDim,
                        border: `1px solid ${ach.acctType === t ? C.amber : C.line}` }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Routing number */}
                <div style={{ marginBottom: 12 }}>
                  <label style={achLabel}>Routing number</label>
                  <input value={ach.routing}
                    onChange={(e) => setA("routing")(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    inputMode="numeric" placeholder="9 digits"
                    style={achInput(routingValid || ach.routing.length === 0)} />
                  {ach.routing.length > 0 && !routingValid && (
                    <span style={achErr}>Routing number must be 9 digits.</span>
                  )}
                </div>

                {/* Account number */}
                <div style={{ marginBottom: 12 }}>
                  <label style={achLabel}>Account number</label>
                  <input value={ach.account}
                    onChange={(e) => setA("account")(e.target.value.replace(/\D/g, "").slice(0, 17))}
                    inputMode="numeric" placeholder="Account number"
                    style={achInput(accountValid || ach.account.length === 0)} />
                  {ach.account.length > 0 && !accountValid && (
                    <span style={achErr}>Enter a valid account number (4–17 digits).</span>
                  )}
                </div>

                {/* Confirm account number */}
                <div style={{ marginBottom: 12 }}>
                  <label style={achLabel}>Confirm account number</label>
                  <input value={ach.confirm}
                    onChange={(e) => setA("confirm")(e.target.value.replace(/\D/g, "").slice(0, 17))}
                    inputMode="numeric" placeholder="Re-enter account number"
                    style={achInput(confirmMatch || ach.confirm.length === 0)} />
                  {ach.confirm.length > 0 && !confirmMatch && (
                    <span style={achErr}>Account numbers don't match.</span>
                  )}
                </div>

                {/* Authorization */}
                <div onClick={() => setA("authorized")(!ach.authorized)} style={{
                  display: "flex", gap: 10, cursor: "pointer", alignItems: "flex-start",
                  padding: "10px 0", marginTop: 2 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    border: `1px solid ${ach.authorized ? C.green : C.lineHi}`,
                    background: ach.authorized ? C.green : "transparent", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000" }}>
                    {ach.authorized ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: C.textDim }}>
                    I authorize Music Habitat, Inc. to electronically debit ${amt.toLocaleString()} from
                    the account above via ACH, and confirm I am an authorized signer.
                  </span>
                </div>

                <button onClick={submitAch} disabled={!achComplete} style={{
                  width: "100%", marginTop: 10, padding: "13px 0", borderRadius: 10,
                  background: C.amber, color: "#1A1206", border: "none", fontWeight: 700, fontSize: 14,
                  cursor: achComplete ? "pointer" : "default", opacity: achComplete ? 1 : 0.5,
                  fontFamily: FONT_DISPLAY }}>
                  Authorize ACH Debit
                </button>

                <p style={{ fontSize: 10.5, color: C.textFaint, lineHeight: 1.5, marginTop: 10 }}>
                  {/* BACKEND HOOK: tokenize via FUNDING.achProcessorEndpoint (Plaid/Stripe). */}
                  Your bank details are transmitted securely to our payment processor. Music Habitat
                  does not store raw account numbers.
                </p>
              </div>
            )}
          </div>
        )}
        {method === "check" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.amber, marginBottom: 10 }}>
              Mail a Certified Check
            </div>
            {[["Payable to", FUNDING.checkPayee], ["Mail to", FUNDING.checkAddress],
              ["Amount", `$${amt.toLocaleString()}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
                borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>
                <span style={{ color: C.textFaint }}>{k}</span>
                <span style={{ color: C.text, textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Btn variant="amber" onClick={() => go("page12")}>I've Initiated Funding</Btn>
      <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
        Your position is confirmed once funds clear and the Company accepts your subscription.
      </p>
    </Shell>
  );
}

// Shared styles for the ACH form fields on Page 11.
