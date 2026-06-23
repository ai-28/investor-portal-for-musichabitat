import type { OfferingType } from "@/lib/portal/db-types";

/** Local PDFs/DOCX under public/assets/docs/{folder}/ */
export const DOCS_BASE = "/assets/docs";

export const DOC_FOLDERS: Record<OfferingType, string> = {
  friends_family: "F & F",
  private: "Private Offering",
};

function docUrl(folder: string, filename: string): string {
  return `${DOCS_BASE}/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
}

const FF_FILES = {
  execsum: "🟢 MusicHabitat Executive Summary FF.pdf",
  deck: "🟢MusicHabitat FF PitchDeck.pdf",
  bizplan: "🟢MusicHabitat BusinessPlan.pdf",
  model: "MusicHabitat Financial Model.pdf",
  team: "🟢 MusicHabitat Master Team.pdf",
  services: "MusicHabitat StageBid Services.pdf",
  term_sheet: "🟢 MusicHabitat TermSheet FF.pdf",
  proceeds: "MusicHabitat Use of Proceeds.pdf",
  safe: "🟢 SAFE Agreement UPDATED.pdf",
  warrant: "🟢 Warrant Agreement UPDATED.pdf",
  operating: "🟢 MusicHabitat Operating Agreement (1).pdf",
  subscription: "MusicHabitat Subscription.pdf",
} as const;

const PRIVATE_FILES = {
  execsum: "🆕 MusicHabitat ExecSummary Private506c.pdf",
  deck: "MusicHabitat PitchDeck Private506c.pdf",
  bizplan: "🟢MusicHabitat BusinessPlan.pdf",
  model: "MusicHabitat Financial Model.pdf",
  team: "MusicHabitat Master Team.pdf",
  services: "MusicHabitat StageBid Services.pdf",
  term_sheet: "🆕 MusicHabitat TermSheet Private506c.pdf",
  proceeds: "MusicHabitat Use of Proceeds.pdf",
  safe: "MusicHabitat SAFE Private506c.pdf",
  warrant: "MusicHabitat Warrant Private506c.pdf",
  operating: "🆕 MusicHabitat Operating Agreement.pdf",
  subscription: "MusicHabitat Subscription Private506c.pdf",
} as const;

export type DocSourceKey = keyof typeof FF_FILES;

function buildSources(
  folder: string,
  files: Record<DocSourceKey, string>,
): Record<DocSourceKey, string> {
  const out = {} as Record<DocSourceKey, string>;
  for (const [key, filename] of Object.entries(files) as [DocSourceKey, string][]) {
    out[key] = docUrl(folder, filename);
  }
  return out;
}

export const DOC_SOURCES_BY_TRACK: Record<
  OfferingType,
  Record<DocSourceKey, string>
> = {
  friends_family: buildSources(DOC_FOLDERS.friends_family, FF_FILES),
  private: buildSources(DOC_FOLDERS.private, PRIVATE_FILES),
};

export function getDocSource(track: OfferingType, key: string): string {
  const sources = DOC_SOURCES_BY_TRACK[track];
  return sources[key as DocSourceKey] ?? "";
}

/** F&F executive summary PDF (page 1 download hook). */
export const HOSTED_EXEC_SUMMARY_URL = DOC_SOURCES_BY_TRACK.friends_family.execsum;

// Which docIds open as a real PDF render (vs. the in-portal reader).
export const PDF_RENDER_IDS = new Set(["term_sheet", "termsheet_c", "termsheet_i", "execsum"]);

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

// ---- Prototype visuals + live link ------------------------------------------
export const PROTOTYPE_IMAGES = [
  "/assets/prototype/1.png",
  "/assets/prototype/2.png",
  "/assets/prototype/3.png",
  "/assets/prototype/4.png",
  "/assets/prototype/5.png",
];
export const PROTOTYPE_LIVE_URL = "";
