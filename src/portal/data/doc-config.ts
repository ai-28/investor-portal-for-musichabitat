export const HOSTED_EXEC_SUMMARY_URL = "";


export const DOC_SOURCES = {
  term_sheet: "", // BACKEND HOOK: Term Sheet PDF URL
  execsum:    "", // BACKEND HOOK: Executive Summary PDF URL
  deck:       "", // BACKEND HOOK: Pitch Deck PDF URL
  model:      "", // BACKEND HOOK: Financial Model PDF URL
  bizplan:    "", // BACKEND HOOK: Business Plan PDF URL
  // Closing instruments — drop the EXECUTED/signed PDFs here. Once set, the
  // viewer shows the real signed file and download fetches that same file
  // (overriding the generated full-text version).
  safe:         "", // BACKEND HOOK: executed SAFE PDF URL
  warrant:      "", // BACKEND HOOK: executed Warrant PDF URL
  subscription: "", // BACKEND HOOK: executed Subscription PDF URL
  offering:     "", // BACKEND HOOK: Offering Package PDF URL
  stockholders: "", // BACKEND HOOK: executed Stockholders' Agreement PDF URL
  operating:    "", // BACKEND HOOK: executed Operating Agreement PDF URL
  proceeds:     "", // BACKEND HOOK: Use of Proceeds PDF URL
};

// ---- Prototype visuals + live link ------------------------------------------
// Up to 5 mobile-app screenshots. BACKEND HOOK: drop hosted image URLs in order;
// empty slots render as numbered placeholder phone frames. e.g.
//   "https://www.musichabitat.com/proto/01-home.png"
export const PROTOTYPE_IMAGES = [
  "", // BACKEND HOOK: app visual 1
  "", // BACKEND HOOK: app visual 2
  "", // BACKEND HOOK: app visual 3
  "", // BACKEND HOOK: app visual 4
  "", // BACKEND HOOK: app visual 5
];
// Live interactive prototype. Shown only at Music Habitat's discretion: leave ""
// to hide the "Open Live Prototype" button; investors always see the
// "Request prototype access" mailto button regardless.
export const PROTOTYPE_LIVE_URL = ""; // BACKEND HOOK: Figma/TestFlight/hosted prototype URL

// Which docIds open as a real PDF render (vs. the in-portal reader).
export const PDF_RENDER_IDS = new Set(["term_sheet", "termsheet_c", "termsheet_i", "execsum"]);

// Normalize the portal's several term-sheet ids to one source key.

export const DOCUSIGN = {
  enabled: false, // BACKEND HOOK: set true once envelope creation is wired
  // BACKEND HOOK: your server endpoint that returns { url } for the embedded signing view
  createEnvelopeEndpoint: "", // e.g. "https://api.musichabitat.com/docusign/envelope"
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
