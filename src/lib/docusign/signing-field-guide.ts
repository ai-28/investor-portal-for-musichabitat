/** Per-document signature page field checklists for freeform DocuSign signing. */

export interface SigningFieldGuide {
  /** Last page of the PDF where the execution / signature block lives. */
  signaturePageHint: string;
  investorFields: string[];
  ceoFields: string[];
}

export const SIGNING_FIELD_GUIDES: Record<string, SigningFieldGuide> = {
  safe: {
    signaturePageHint: "last page — INVESTOR column on the right",
    investorFields: [
      "NAME (text)",
      "SIGNATURE",
      "DATE",
      "SAFE AMOUNT ($) (text)",
      "EMAIL (text)",
      "ADDRESS (text)",
    ],
    ceoFields: [
      "Signature (COMPANY column, left — near BY / NAME)",
      "DATE",
      "EMAIL (text)",
    ],
  },
  warrant: {
    signaturePageHint: "last page — follow INVESTOR / COMPANY column labels",
    investorFields: [
      "NAME (text)",
      "SIGNATURE",
      "DATE",
      "EMAIL (text)",
      "ADDRESS (text)",
    ],
    ceoFields: [
      "Signature (COMPANY column, left)",
      "DATE",
      "EMAIL (text)",
    ],
  },
  subscription: {
    signaturePageHint: "last page — follow INVESTOR / COMPANY column labels",
    investorFields: [
      "NAME (text)",
      "SIGNATURE",
      "DATE",
      "EMAIL (text)",
      "ADDRESS (text)",
    ],
    ceoFields: [
      "Signature (COMPANY column, left)",
      "DATE",
      "EMAIL (text)",
    ],
  },
  p_subscription: {
    signaturePageHint: "last page — follow INVESTOR / COMPANY column labels",
    investorFields: [
      "NAME (text)",
      "SIGNATURE",
      "DATE",
      "EMAIL (text)",
      "ADDRESS (text)",
    ],
    ceoFields: [
      "Signature (COMPANY column, left)",
      "DATE",
      "EMAIL (text)",
    ],
  },
};

export function getSigningFieldGuide(docId: string): SigningFieldGuide | null {
  return SIGNING_FIELD_GUIDES[docId] ?? null;
}

/** Bump when envelope creation strategy changes — non-completed envelopes are recreated. */
export const DOCUSIGN_ENVELOPE_MODE_VERSION = 5;
