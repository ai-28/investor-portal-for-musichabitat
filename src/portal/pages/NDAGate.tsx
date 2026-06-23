"use client";

import { useEffect, useState } from "react";
import { C, FONT_DISPLAY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { DocuSignMark } from "@/portal/ui/DocuSignMark";
import { usePortal } from "@/portal/PortalProvider";
import { useSigningFlow } from "@/portal/hooks/useSigningFlow";
import { MUTUAL_NDA_PDF_URL } from "@/portal/data/doc-config";
import { SigningFieldGuidePanel } from "@/portal/ui/SigningFieldGuide";
import { skipProgressGates } from "@/portal/lib/demo";

const NDA_DOC_ID = "nda";
const NDA_DOC_IDS = [NDA_DOC_ID];

export function NDAGate({
  track,
  accent = C.amber,
  onBack,
}: {
  track: OfferingType;
  accent?: string;
  onBack: () => void;
}) {
  const { user, continueAfterNda, refreshState } = usePortal();
  const [ndaSigned, setNdaSigned] = useState<Record<string, boolean>>({});

  const investorName =
    user?.email?.split("@")[0] || "Investor";
  const investor = { fullName: investorName, email: user?.email ?? "" };

  const { enabled, busy, error, statuses, signOne, downloadDoc, statusLabel, refreshStatus } =
    useSigningFlow({
      track,
      signed: ndaSigned,
      setSigned: setNdaSigned,
      investor,
      docIds: NDA_DOC_IDS,
    });

  const status = statuses[NDA_DOC_ID];
  const fullyExecuted = Boolean(ndaSigned[NDA_DOC_ID]);
  const investorSignedAwaitingCeo = status === "investor_signed";
  const awaitingInvestorSign = status === "sent";
  const canDownload =
    status === "investor_signed" || status === "completed";

  useEffect(() => {
    if (!investorSignedAwaitingCeo && !awaitingInvestorSign) return;
    const id = window.setInterval(() => refreshStatus(true), 5000);
    return () => window.clearInterval(id);
  }, [investorSignedAwaitingCeo, awaitingInvestorSign, refreshStatus]);

  useEffect(() => {
    if (fullyExecuted) refreshState().catch(() => {});
  }, [fullyExecuted, refreshState]);

  const canContinueNda = skipProgressGates() || fullyExecuted;

  return (
    <Shell onBack={onBack}>
      <div style={{ paddingTop: 28, textAlign: "center" }}>
        <div style={{ fontSize: 32 }}>🔏</div>
        <Kicker color={accent}>Before You Continue</Kicker>
        <H size={26}>Mutual Non-Disclosure Agreement</H>
        <p
          style={{
            color: C.textDim,
            fontSize: 13.5,
            lineHeight: 1.6,
            margin: "10px 0 0",
          }}
        >
          Review the mutual NDA below. Both you and Music Habitat (Brandon Beard, CEO)
          must sign via DocuSign before you can access offering materials.
        </p>
        <p
          style={{
            color: C.textFaint,
            fontSize: 12,
            lineHeight: 1.5,
            margin: "8px 0 0",
          }}
        >
          In DocuSign: open the Signature Page, use <strong>Add Fields</strong> for
          Signature / Date / Text in your column (right / Counterparty), then click{" "}
          <strong>Finish</strong>. Closing the window without Finish does not count as
          signed.
        </p>
        {!fullyExecuted && !investorSignedAwaitingCeo && (
          <SigningFieldGuidePanel
            docId={NDA_DOC_ID}
            docName="Mutual NDA"
            investorName={investorName}
            investorEmail={user?.email}
          />
        )}
      </div>

      <Card style={{ marginTop: 18, padding: "18px 16px", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            color: C.textFaint,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: FONT_DISPLAY,
            marginBottom: 10,
          }}
        >
          MusicHabitat Mutual NDA v2.pdf
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn
            variant={accent === C.teal ? "teal" : "ghost"}
            onClick={() =>
              window.open(MUTUAL_NDA_PDF_URL, "_blank", "noopener,noreferrer")
            }
          >
            View in New Tab
          </Btn>
          <Btn
            variant={accent === C.teal ? "teal" : "ghost"}
            onClick={() => {
              const anchor = document.createElement("a");
              anchor.href = MUTUAL_NDA_PDF_URL;
              anchor.download = "MusicHabitat Mutual NDA v2.pdf";
              anchor.click();
            }}
          >
            Download PDF
          </Btn>
        </div>
      </Card>

      <Card
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderColor: fullyExecuted ? C.green : C.line,
        }}
      >
        <DocuSignMark size={22} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Mutual NDA</div>
          <div
            style={{
              fontSize: 11,
              color: fullyExecuted ? C.green : C.textFaint,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            {statusLabel(status, enabled)}
          </div>
        </div>
        {canDownload && (
          <button
            type="button"
            onClick={() => downloadDoc(NDA_DOC_ID)}
            style={{
              padding: "9px 12px",
              borderRadius: 8,
              background: C.cardHi,
              color: C.text,
              border: `1px solid ${C.line}`,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: FONT_DISPLAY,
            }}
          >
            Download
          </button>
        )}
        {!fullyExecuted && (
          <button
            type="button"
            onClick={() => signOne(NDA_DOC_ID)}
            disabled={busy === NDA_DOC_ID}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              background: busy === NDA_DOC_ID ? C.lineHi : accent,
              color: accent === C.teal ? "#04252A" : "#1A1206",
              border: "none",
              fontWeight: 700,
              fontSize: 13,
              cursor: busy === NDA_DOC_ID ? "wait" : "pointer",
              fontFamily: FONT_DISPLAY,
            }}
          >
            {busy === NDA_DOC_ID ? "Opening…" : "Sign NDA"}
          </button>
        )}
      </Card>

      {!enabled && (
        <p
          style={{
            fontSize: 12,
            color: C.textFaint,
            lineHeight: 1.5,
            marginTop: 10,
            textAlign: "center",
          }}
        >
          DocuSign is not configured — demo mode simulates signature on click.
        </p>
      )}

      {investorSignedAwaitingCeo && (
        <Card style={{ marginTop: 14, padding: "16px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: C.text }}>
            Waiting for Music Habitat countersignature
          </div>
          <p
            style={{
              fontSize: 13,
              color: C.textDim,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            You&apos;ve signed the NDA. Brandon Beard (CEO) will countersign via DocuSign
            email. This page updates automatically when the agreement is fully executed.
          </p>
        </Card>
      )}

      {error ? (
        <p style={{ fontSize: 12, color: C.red, marginTop: 10, lineHeight: 1.5 }}>
          {error}
        </p>
      ) : null}

      <Btn
        variant={accent === C.teal ? "teal" : "amber"}
        onClick={() => canContinueNda && continueAfterNda(track)}
        disabled={!canContinueNda}
        style={{ marginTop: 16 }}
      >
        Continue
      </Btn>
      {!canContinueNda && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          Sign the NDA above. You can continue once both you and the CEO have fully executed
          the agreement.
        </p>
      )}
    </Shell>
  );
}
