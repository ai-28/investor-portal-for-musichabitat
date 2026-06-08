export const PRIVATE = {
  // Offering economics (priced round). Founder-confirmed price per share.
  pricePerShare: 1.25,           // priced Class B Preferred — founder-confirmed
  minInvestment: 2500,
  raiseTarget: 750000,           // private allocation target
  raised: 0,
  shareClass: "Class B Preferred",
  // Document Center — Private track. Mirrors DOC_CENTER.company; investor docs swap
  // SAFE/Warrant for the Stock Purchase Agreement. Reuses shared viewer ids where the
  // underlying document is identical across tracks.
  docs: {
    company: [
      { id: "execsum",     name: "Executive Summary", action: "download" },
      { id: "deck",        name: "Pitch Deck", action: "view" },
      { id: "bizplan",     name: "Business Plan", action: "view" },
      { id: "model",       name: "Financial Model", action: "view" },
      { id: "team",        name: "Leadership Team", action: "view" },
      { id: "services",    name: "Services", action: "view" },
      { id: "prototype",   name: "Prototype View", action: "view" },
    ],
    investor: [
      { id: "termsheet_i", name: "Term Sheet — Private (Priced Class B)", action: "download" },
      { id: "proceeds",     name: "Use of Proceeds", action: "download" },
      { id: "stockpurchase",name: "Stock Purchase & Transfer Agreement", action: "download" },
      { id: "operating",    name: "Operating Agreement", action: "download" },
      { id: "stockholders", name: "Stockholders' Agreement", action: "download" },
      { id: "subscription", name: "Subscription Agreement & Questionnaire", action: "download" },
    ],
  },
  // The three closing instruments for the Private track (priced stock, no SAFE/Warrant).
  signDocs: [
    { id: "p_stockpurchase", name: "Stock Purchase & Transfer Agreement" },
    { id: "p_subscription",  name: "Subscription Agreement & Investor Questionnaire" },
    { id: "p_stockholders",  name: "Stockholders' Agreement" },
  ],
};

export const PP_TOTAL = 11; // private flow step count

// ---- Private step indicator (teal lane) -------------------------------------
