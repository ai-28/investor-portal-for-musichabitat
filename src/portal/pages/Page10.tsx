"use client";

import { useEffect, useState } from "react";
import { useSigningFlow } from "@/portal/hooks/useSigningFlow";
import { C, FONT_DISPLAY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { DocuSignMark } from "@/portal/ui/DocuSignMark";
import { SigningFieldGuidePanel } from "@/portal/ui/SigningFieldGuide";
import { DOCUSIGN } from "@/portal/data/doc-config";
import { patchPortalState } from "@/lib/portal/sync-client";
import type { Dispatch, SetStateAction } from "react";
import type { InvestorApp, SignedMap } from "@/portal/types";

export function Page10({ go, onBack, signed, setSigned, app }: {
  go: (route: string) => void;
  onBack: () => void;
  signed: SignedMap;
  setSigned: Dispatch<SetStateAction<SignedMap>>;
  app: InvestorApp;
}) {
  const docs = DOCUSIGN.documents;
  const { enabled, busy, error, statuses, signOne, downloadDoc, statusLabel } = useSigningFlow({
    track: "friends_family",
    signed,
    setSigned,
    investor: app,
  });
  const signedCount = docs.filter((d) => signed[d.id]).length;
  const allSigned = signedCount === docs.length;
  const awaitingCeo = docs.filter((d) => statuses[d.id] === "investor_signed");
  const [ceoSignUrls, setCeoSignUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!awaitingCeo.length) {
      setCeoSignUrls({});
      return;
    }
    awaitingCeo.forEach((d) => {
      fetch(
        `/api/docusign/ceo-sign-url?track=friends_family&docId=${encodeURIComponent(d.id)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setCeoSignUrls((prev) => ({ ...prev, [d.id]: data.url }));
          }
        })
        .catch(() => {});
    });
  }, [awaitingCeo.map((d) => d.id).join(",")]);

  return (
    <Shell step={10} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
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
        const done = signed[d.id];
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
            investorName={app.fullName}
            investorEmail={app.email}
            investorAmount={app.amount}
          />
        ))}

      {enabled && awaitingCeo.length > 0 && (
        <Card style={{ marginTop: 14, padding: "16px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            CEO countersign
          </div>
          <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.55, margin: "0 0 12px" }}>
            Waiting for CEO on {awaitingCeo.length} document
            {awaitingCeo.length > 1 ? "s" : ""}. Each link opens DocuSign for that
            agreement only.
          </p>
          {awaitingCeo.map((d) => (
            <div
              key={d.id}
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{d.name}</span>
              <Btn
                variant="teal"
                disabled={!ceoSignUrls[d.id]}
                onClick={() =>
                  ceoSignUrls[d.id] &&
                  window.open(ceoSignUrls[d.id], "_blank", "noopener,noreferrer")
                }
              >
                Open CEO link
              </Btn>
              <Btn
                variant="ghost"
                disabled={!ceoSignUrls[d.id]}
                onClick={() => {
                  if (ceoSignUrls[d.id]) navigator.clipboard.writeText(ceoSignUrls[d.id]);
                }}
              >
                Copy link
              </Btn>
            </div>
          ))}
          <p style={{ fontSize: 11, color: C.textFaint, margin: "8px 0 0", lineHeight: 1.5 }}>
            This page updates automatically when the CEO finishes each document.
          </p>
        </Card>
      )}

      <Btn
        variant="amber"
        onClick={() => {
          if (!allSigned) return;
          void (async () => {
            try {
              await patchPortalState({ application_status: "signed" });
            } catch (err) {
              console.error("Failed to mark application signed", err);
            }
            await go("page11");
          })();
        }}
        style={{ opacity: allSigned ? 1 : 0.5 }}
      >
        Continue to Funding
      </Btn>
      {!allSigned && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          All three documents must be fully executed (investor + CEO) before funding.
        </p>
      )}
    </Shell>
  );
}
