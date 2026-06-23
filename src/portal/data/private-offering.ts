export const PRIVATE = {
  pricePerShare: 1.25,
  minInvestment: 2500,
  raiseTarget: 750000,
  raised: 0,
  shareClass: "Class B Preferred",
  docs: {
    company: [
      { id: "execsum", name: "Executive Summary", action: "download" },
      { id: "deck", name: "Pitch Deck", action: "view" },
      { id: "bizplan", name: "Business Plan", action: "view" },
      { id: "model", name: "Financial Model", action: "view" },
      { id: "team", name: "Leadership Team", action: "view" },
      { id: "services", name: "Services", action: "view" },
      { id: "prototype", name: "Prototype View", action: "view" },
    ],
    investor: [
      { id: "termsheet_i", name: "Term Sheet", action: "download" },
      { id: "proceeds", name: "Use of Proceeds", action: "download" },
      { id: "safe", name: "SAFE Agreement", action: "download" },
      { id: "warrant", name: "Warrant Agreement", action: "download" },
      { id: "operating", name: "Operating Agreement", action: "download" },
      { id: "subscription", name: "Subscription Agreement & Questionnaire", action: "download" },
    ],
  },
  signDocs: [
    { id: "safe", name: "SAFE Agreement" },
    { id: "warrant", name: "Warrant Agreement" },
    { id: "subscription", name: "Subscription Agreement & Questionnaire" },
  ],
};

export const PP_TOTAL = 11;
