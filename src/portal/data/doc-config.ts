export const HOSTED_EXEC_SUMMARY_URL = "/assets/docs/MusicHabitat%20Executive%20Summary%20FF.pdf";

/** Local PDFs/DOCX under public/assets/docs */
export const DOCS_BASE = "/assets/docs";

function docUrl(filename: string) {
  return `${DOCS_BASE}/${encodeURIComponent(filename)}`;
}

export const DOC_SOURCES = {
  term_sheet: docUrl("MusicHabitat TermSheet Private506c.pdf"),
  execsum:    docUrl("MusicHabitat Executive Summary FF.pdf"),
  deck:       docUrl("MusicHabitat FF PitchDeck.pdf"),
  model:      docUrl("MusicHabitat Financial Model.pdf"),
  bizplan:    docUrl("MusicHabitat BusinessPlan.pdf"),
  services:   docUrl("MusicHabitat StageBid Services.pdf"),
  // Closing instruments — drop the EXECUTED/signed PDFs here. Once set, the
  // viewer shows the real signed file and download fetches that same file
  // (overriding the generated full-text version).
  safe:         docUrl("MusicHabitat SAFE Private506c.pdf"),
  warrant:      docUrl("MusicHabitat Warrant Private506c.pdf"),
  subscription: docUrl("MusicHabitat Subscription Private506c.pdf"),
  offering:     "", // BACKEND HOOK: Offering Package PDF URL
  stockholders: "", // BACKEND HOOK: executed Stockholders' Agreement PDF URL
  operating:    docUrl("MusicHabitat Operating Agreement.pdf"),
  proceeds:     docUrl("MusicHabitat Use of Proceeds.pdf"),
};

// ---- Prototype visuals + live link ------------------------------------------
// Up to 5 mobile-app screenshots (public/assets/prototype/1.png … 5.png).
export const PROTOTYPE_IMAGES = [
  "/assets/prototype/1.png",
  "/assets/prototype/2.png",
  "/assets/prototype/3.png",
  "/assets/prototype/4.png",
  "/assets/prototype/5.png",
];
// Live interactive prototype. Shown only at Music Habitat's discretion: leave ""
// to hide the "Open Live Prototype" button; investors always see the
// "Request prototype access" mailto button regardless.
export const PROTOTYPE_LIVE_URL = ""; // BACKEND HOOK: Figma/TestFlight/hosted prototype URL

// Which docIds open as a real PDF render (vs. the in-portal reader).
export const PDF_RENDER_IDS = new Set(["term_sheet", "termsheet_c", "termsheet_i", "execsum"]);

// Normalize the portal's several term-sheet ids to one source key.

export const DOCUSIGN = {
  enabled: true,
  createEnvelopeEndpoint: "/api/docusign/envelope",
  documents: [
    { id: "safe", name: "SAFE Agreement" },
    { id: "warrant", name: "Warrant Agreement" },
    { id: "subscription", name: "Subscription Agreement & Questionnaire" },
  ],
};

export const FUNDING = {
  // BACKEND HOOK: replace with real, voice-verified banking details delivered
  // out-of-band. Never hard-code live wire instructions in client code in production.
  bankName: "—", routing: "—", account: "—", beneficiary: "Music Habitat, Inc.",
  achEnabled: true,   // ACH pull enabled (investor enters their bank details)
  // BACKEND HOOK: send ACH authorization to a tokenizing processor (Plaid/Stripe),
  // never POST raw routing/account numbers to your own server.
  achProcessorEndpoint: "", // e.g. "https://api.musichabitat.com/ach/authorize"
  checkPayee: "Music Habitat, Inc.",
  checkAddress: "Music Habitat, Inc. · Kalispell, MT",
};


export const CALENDLY_URL = "";
