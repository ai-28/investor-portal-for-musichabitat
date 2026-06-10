"use client";

import { getSigningFieldGuide } from "@/lib/docusign/signing-field-guide";
import { C } from "@/portal/tokens";

export function SigningFieldGuidePanel({
  docId,
  docName,
  investorName,
  investorEmail,
  investorAmount,
}: {
  docId: string;
  docName?: string;
  investorName?: string;
  investorEmail?: string;
  investorAmount?: string;
}) {
  const guide = getSigningFieldGuide(docId);
  if (!guide) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: 8,
        border: `1px solid ${C.line}`,
        background: C.cardHi,
        fontSize: 11,
        color: C.textDim,
        lineHeight: 1.55,
      }}
    >
      {docName && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.text,
            marginBottom: 6,
          }}
        >
          {docName}
        </div>
      )}
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>
        On the {guide.signaturePageHint}
      </div>
      <p style={{ margin: "0 0 8px" }}>
        Use DocuSign&apos;s <strong style={{ color: C.text }}>Add Fields</strong> (or drag
        signature / date / text) to place each item on the matching printed line, then click{" "}
        <strong style={{ color: C.text }}>Finish</strong>.
      </p>
      {(investorName || investorEmail || investorAmount) && (
        <p style={{ margin: "0 0 8px", color: C.textFaint }}>
          Your info:{" "}
          {[investorName, investorEmail, investorAmount ? `$${investorAmount}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div
            style={{
              fontWeight: 600,
              color: C.teal,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              fontSize: 10,
              marginBottom: 4,
            }}
          >
            You (investor)
          </div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {guide.investorFields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div>
          <div
            style={{
              fontWeight: 600,
              color: C.textFaint,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              fontSize: 10,
              marginBottom: 4,
            }}
          >
            CEO (after you)
          </div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {guide.ceoFields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 10, color: C.textFaint }}>
        Requires freeform signing in DocuSign Admin (Signing Settings). If you only see a
        fixed stamp, ask Brandon to enable recipient field placement.
      </p>
    </div>
  );
}
