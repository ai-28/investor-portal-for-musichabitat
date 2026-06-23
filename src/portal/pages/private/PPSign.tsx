"use client";

import { useSigningFlow } from "@/portal/hooks/useSigningFlow";
import { C, FONT_DISPLAY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { DocuSignMark } from "@/portal/ui/DocuSignMark";
import { SigningFieldGuidePanel } from "@/portal/ui/SigningFieldGuide";
import { PRIVATE } from "@/portal/data/private-offering";
import { PPStep } from "@/portal/ui/PPStep";

export function PPSign({ go, onBack, psigned, setPsigned, papp }) {
  const docs = PRIVATE.signDocs;
  const { enabled, busy, error, statuses, signOne, downloadDoc, statusLabel } = useSigningFlow({
    track: "private",
    signed: psigned,
    setSigned: setPsigned,
    investor: papp,
  });
  const signedCount = docs.filter((d) => psigned[d.id]).length;
  const allSigned = signedCount === docs.length;

  return (
    <Shell onBack={onBack}>
      <PPStep step={8} />
      <div style={{ paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DocuSignMark size={20} />
          <Kicker color={C.teal}>Secure E-Signature</Kicker>
        </div>
        <H size={26}>Sign Your Documents</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          {signedCount} of {docs.length} fully executed.
          {enabled
            ? " You sign here; CEO Brandon receives a countersign email after each document."
            : " Demo mode — click Sign to simulate completion."}
        </p>
      </div>

      {docs.map((d) => {
        const done = psigned[d.id];
        const status = statuses[d.id];
        const canDownload =
          status === "investor_signed" || status === "completed";
        return (
          <Card key={d.id} style={{ display: "flex", alignItems: "center", gap: 12,
            borderColor: done ? C.green : C.line }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: done ? C.green : C.cardHi, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 14, color: done ? "#000" : C.textFaint }}>
              {done ? "✓" : "✍"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 11, color: done ? C.green : C.textFaint,
                textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>
                {statusLabel(status, enabled)}
              </div>
            </div>
            {canDownload && (
              <button
                onClick={() => downloadDoc(d.id)}
                style={{ padding: "9px 12px", borderRadius: 8,
                  background: C.cardHi, color: C.text, border: `1px solid ${C.line}`,
                  fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: FONT_DISPLAY }}>
                Download
              </button>
            )}
            {!done && (
              <button
                onClick={() => signOne(d.id)}
                disabled={busy === d.id}
                style={{ padding: "9px 16px", borderRadius: 8,
                  background: busy === d.id ? C.lineHi : C.teal,
                  color: "#04252A", border: "none", fontWeight: 700, fontSize: 13,
                  cursor: busy === d.id ? "wait" : "pointer", fontFamily: FONT_DISPLAY,
                  opacity: busy && busy !== d.id ? 0.5 : 1 }}>
                {busy === d.id ? "Opening…" : "Sign"}
              </button>
            )}
          </Card>
        );
      })}

      {error && (
        <p style={{ fontSize: 12, color: C.red, lineHeight: 1.5, marginTop: 8 }}>{error}</p>
      )}

      {enabled &&
        docs.map((d) => (
          <SigningFieldGuidePanel
            key={d.id}
            docId={d.id}
            docName={d.name}
            investorName={papp.fullName}
            investorEmail={papp.email}
            investorAmount={papp.amount}
          />
        ))}

      <Btn variant="teal" disabled={!allSigned} onClick={() => go("pp_fund")}>
        Continue to Funding
      </Btn>
      {!allSigned && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          All documents must be fully executed before funding.
        </p>
      )}
    </Shell>
  );
}
