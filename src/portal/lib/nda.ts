// @ts-nocheck
export function ndaClauses(trackLabel) {
  return [
    ["1. Parties",
      "This Non-Disclosure Agreement (the “Agreement”) is entered into by and between the undersigned prospective investor (the “Recipient”) and Music Habitat, Inc., a Montana corporation (the “Company”). The Recipient is the disclosing party's counterparty; the obligations of confidentiality under this Agreement are undertaken solely by the Recipient in favor of the Company."],
    ["2. Purpose",
      "The Company wishes to share certain confidential information with the Recipient so that the Recipient may evaluate a possible investment in connection with " + trackLabel + " (the “Purpose”). This Agreement governs the Recipient's use and protection of that information."],
    ["3. Confidential Information",
      "“Confidential Information” means all non-public information disclosed by the Company to the Recipient, in any form (oral, written, electronic, or visual), including but not limited to the Executive Summary, Pitch Deck, Business Plan, Financial Model and projections, Services documentation, the working prototype, term sheets, capitalization details, valuation, the existence and terms of any offering, and all other offering and legal documents — together with all notes, analyses, or materials the Recipient derives from them."],
    ["4. Recipient's Obligations",
      "The Recipient shall: (a) hold all Confidential Information in strict confidence; (b) use it solely for the Purpose and for no other use; (c) not disclose it to any third party without the Company's prior written consent; (d) limit access to advisors who need to know it for the Purpose and who are bound by confidentiality obligations at least as protective as those here, for whom the Recipient remains responsible; and (e) protect it using at least the same degree of care the Recipient uses for its own confidential information, and in no event less than a reasonable degree of care."],
    ["5. Exclusions",
      "Confidential Information does not include information that: (a) is or becomes publicly available through no act or omission of the Recipient; (b) was lawfully known to the Recipient without obligation of confidentiality before disclosure by the Company; (c) is lawfully received from a third party without restriction and without breach of any obligation; or (d) is independently developed by the Recipient without use of or reference to the Confidential Information."],
    ["6. Compelled Disclosure",
      "If the Recipient is required by law, regulation, or valid legal process to disclose any Confidential Information, the Recipient shall, to the extent legally permitted, give the Company prompt prior written notice so the Company may seek a protective order or other remedy, and shall disclose only that portion legally required."],
    ["7. No License; No Offer",
      "All Confidential Information remains the sole property of the Company. Nothing in this Agreement grants the Recipient any license or ownership right in the Confidential Information or any Company intellectual property. The Confidential Information does not constitute an offer to sell or a solicitation to buy any security; any investment is made solely pursuant to and in reliance on the Company's executed offering documents."],
    ["8. No Warranty",
      "The Confidential Information is provided “as is.” The Company makes no representation or warranty as to its accuracy or completeness in this Agreement, and the Recipient agrees that any such representations are made only, if at all, in the definitive offering documents."],
    ["9. Term & Return",
      "This Agreement and the Recipient's obligations survive for three (3) years from the date of acceptance. Upon the Company's written request, the Recipient shall promptly return or destroy all Confidential Information (including copies and derivatives) and, if requested, certify such destruction in writing."],
    ["10. Remedies",
      "The Recipient acknowledges that a breach of this Agreement may cause the Company irreparable harm for which monetary damages would be inadequate, and that the Company shall be entitled to seek injunctive and other equitable relief, in addition to any other remedies available at law, without the necessity of posting a bond."],
    ["11. Governing Law",
      "This Agreement is governed by the laws of the State of Montana, consistent with the Company's offering documents, without regard to its conflict-of-laws principles. The parties consent to the exclusive jurisdiction of the state and federal courts located in Montana for any matter not subject to arbitration under the offering documents."],
    ["12. Entire Agreement",
      "This Agreement is the entire understanding between the parties regarding the confidentiality of the Confidential Information and supersedes all prior discussions on that subject. It may be amended only in a writing signed by both parties. If any provision is held unenforceable, the remainder shall remain in full force. The Recipient's typed name below constitutes the Recipient's electronic signature."],
  ];
}

// BACKEND HOOK: replace with a hosted, counsel-approved NDA PDF if desired.
export function downloadNDA(trackLabel, signerName) {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const today = new Date().toLocaleDateString("en-US",
    { year: "numeric", month: "long", day: "numeric" });
  const clauses = ndaClauses(trackLabel);
  const bodyHtml = clauses.map(([h, body]) =>
    `<div class="art"><h2>${esc(h)}</h2><p>${esc(body)}</p></div>`).join("");
  const sig = signerName
    ? `<div class="sig"><div class="sigrow"><span class="signame">${esc(signerName)}</span></div>
        <div class="siglbl">Recipient signature (typed) &nbsp;·&nbsp; Dated ${esc(today)}</div></div>`
    : `<div class="sig"><div class="sigrow"><span class="signame">&nbsp;</span></div>
        <div class="siglbl">Recipient signature &nbsp;·&nbsp; Date</div></div>`;
  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Music Habitat — Non-Disclosure Agreement</title>
<style>
  @page { margin: 48px; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1f; margin: 0; padding: 32px; line-height: 1.55; }
  .mast { font-family: Arial, sans-serif; font-weight: 800; letter-spacing: 1px; font-size: 18px;
    border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 6px; }
  .mast .t { color: #00A9BD; } .mast .g { color: #D9A800; }
  .tag { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 2px; color: #888;
    text-transform: uppercase; margin-bottom: 14px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #555; font-size: 12.5px; margin: 0 0 16px; }
  h2 { font-size: 13px; margin: 16px 0 5px; font-family: Arial, sans-serif; }
  p { margin: 0 0 8px; font-size: 12px; }
  .art { page-break-inside: avoid; }
  .sig { margin-top: 30px; page-break-inside: avoid; }
  .sigrow { border-bottom: 1px solid #333; min-height: 28px; max-width: 320px; }
  .signame { font-family: "Brush Script MT", "Segoe Script", cursive; font-size: 22px; }
  .siglbl { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #888; margin-top: 6px; }
  .disc { font-size: 9px; color: #888; margin-top: 22px; border-top: 1px solid #ddd; padding-top: 10px; line-height: 1.4; }
  @media print { .noprint { display: none; } }
  .noprint { text-align:center; margin: 18px 0; }
  .noprint button { font-family: Arial; font-size: 14px; padding: 10px 22px; background: #D9A800;
    border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style></head><body>
<div class="noprint"><button onclick="window.print()">Save as PDF / Print</button></div>
<div class="mast"><span class="t">MUSIC</span><span class="g">HABITAT</span></div>
<div class="tag">Confidential</div>
<h1>Non-Disclosure Agreement</h1>
<div class="sub">A unilateral confidentiality agreement from the prospective investor (Recipient) to Music Habitat, Inc.</div>
${bodyHtml}
${sig}
<div class="disc">CONFIDENTIAL &amp; PROPRIETARY — NOT FOR DISTRIBUTION. © 2026 Music Habitat, Inc. This document is provided for the Recipient's records. Not legal advice; consult your own advisors.</div>
</body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.open(); win.document.write(html); win.document.close(); }
  else {
    const blob = new Blob([html], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = "MusicHabitat_NDA.html";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
}
