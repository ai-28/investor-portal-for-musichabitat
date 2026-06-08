export const DOC_ID_ALIAS = {
  termsheet_c: "term_sheet", termsheet_i: "term_sheet", term_sheet: "term_sheet",
  execsum: "execsum", deck: "deck", services: "services", team: "team",
  bizplan: "bizplan", model: "model", proceeds: "proceeds",
  safe: "safe", warrant: "warrant", subscription: "subscription",
  offering: "offering", stockholders: "stockholders", operating: "operating",
  stockpurchase: "stockpurchase",
  prototype: "prototype",
};
export function resolveDocKey(docId: string): string {
  return DOC_ID_ALIAS[docId as keyof typeof DOC_ID_ALIAS] || docId;
}
