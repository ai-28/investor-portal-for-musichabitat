// @ts-nocheck
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { EXEC_SUMMARY } from "@/portal/data/content";
import { HOSTED_EXEC_SUMMARY_URL, DOC_SOURCES, PDF_RENDER_IDS } from "@/portal/data/doc-config";
import { READER_CONTENT } from "@/portal/data/reader-content";
import { VERBATIM } from "@/portal/data/verbatim";
import { resolveDocKey } from "@/portal/data/doc-aliases";

export function downloadExecSummaryPDF() {
  if (HOSTED_EXEC_SUMMARY_URL) { window.open(HOSTED_EXEC_SUMMARY_URL, "_blank"); return; }
  const E = EXEC_SUMMARY;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const sec = (n, k, inner) =>
    `<div class="sec"><div class="kick"><b>${n}</b> · ${k.toUpperCase()}</div>${inner}</div>`;
  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Music Habitat — Executive Summary (F&F)</title>
<style>
  @page { margin: 48px; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1f; margin: 0; padding: 32px; line-height: 1.5; }
  .mast { font-family: Arial, sans-serif; font-weight: 800; letter-spacing: 1px; font-size: 18px;
    border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 6px; }
  .mast .t { color: #00A9BD; } .mast .g { color: #D9A800; }
  .tag { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 2px; color: #888;
    text-transform: uppercase; margin-bottom: 14px; }
  h1 { font-size: 24px; line-height: 1.15; margin: 0 0 10px; }
  .intro { color: #555; font-size: 13px; margin-bottom: 18px; }
  .sec { margin-top: 20px; page-break-inside: avoid; }
  .kick { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 2px; color: #00A9BD;
    text-transform: uppercase; margin-bottom: 8px; }
  .kick b { color: #00A9BD; }
  .stitle { font-style: italic; font-size: 15px; margin: 0 0 8px; }
  .item { margin-bottom: 10px; } .item b { font-size: 13px; } .item p { margin: 2px 0 0; color: #555; font-size: 12px; }
  .svc b { color: #00A9BD; }
  .mkt { font-size: 16px; font-weight: bold; } .mkt span { color: #888; font-size: 11px; font-weight: normal; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
  td { padding: 5px 0; border-bottom: 1px solid #eee; }
  .disc { font-size: 9px; color: #888; margin-top: 22px; border-top: 1px solid #ddd; padding-top: 10px; line-height: 1.4; }
  @media print { .noprint { display: none; } }
  .noprint { text-align:center; margin: 18px 0; }
  .noprint button { font-family: Arial; font-size: 14px; padding: 10px 22px; background: #D9A800;
    border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style></head><body>
<div class="noprint"><button onclick="window.print()">Save as PDF / Print</button></div>
<div class="mast"><span class="t">MUSIC</span><span class="g">HABITAT</span></div>
<div class="tag">Executive Summary · F&amp;F · May 2026</div>
<h1>${esc(E.headline)}</h1>
<div class="intro">${esc(E.intro)}</div>
${sec("01","The Problem", `<div class="stitle">${esc(E.problem.title)}</div>` +
  E.problem.items.map(([t,d]) => `<div class="item"><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join(""))}
${sec("02","The Platform", `<div class="stitle">${esc(E.platform.title)}</div>` +
  E.platform.services.map(([n,d]) => `<div class="item svc"><b>${esc(n)}</b><p>${esc(d)}</p></div>`).join(""))}
${sec("03","Market Opportunity",
  E.market.map(([k,v,d]) => `<div class="item"><div class="mkt"><span>${esc(k)}</span> ${esc(v)}</div><p>${esc(d)}</p></div>`).join(""))}
${sec("04","Business Model", `<div class="stitle">${esc(E.businessModel.title)}</div>` +
  E.businessModel.streams.map(([t,d],i) => `<div class="item"><b>${String(i+1).padStart(2,"0")} &nbsp;${esc(t)}</b><p>${esc(d)}</p></div>`).join(""))}
${sec("05","Go-to-Market", `<div class="stitle">${esc(E.gtm.title)}</div>` +
  E.gtm.phases.map(([p,d]) => `<div class="item"><b>${esc(p)}</b><p>${esc(d)}</p></div>`).join(""))}
${sec("06","Financial Trajectory", `<div class="stitle">${esc(E.trajectory.title)}</div>` +
  `<table>` + E.trajectory.metrics.map(([m,...v]) => `<tr><td>${esc(m)}</td><td>Y1 ${esc(v[0])}</td><td>Y2 ${esc(v[1])}</td><td>Y3 ${esc(v[2])}</td></tr>`).join("") +
  `<tr><td>Revenue</td>` + E.trajectory.revenue.map(([,r]) => `<td>$${r}M</td>`).join("") + `</tr></table>` +
  `<p class="item" style="color:#888;font-size:11px">Assumptions · ${esc(E.trajectory.note)}</p>`)}
${sec("07","Use of Proceeds", `<div class="stitle">${esc(E.proceeds.title)}</div>` +
  `<table>` + E.proceeds.items.map(([l,p]) => `<tr><td>${esc(l)}</td><td style="text-align:right"><b>${p}%</b></td></tr>`).join("") + `</table>`)}
${sec("08","Leadership",
  `<table>` + E.leadership.map(([n,r]) => `<tr><td><b>${esc(n)}</b></td><td style="text-align:right;color:#888">${esc(r)}</td></tr>`).join("") + `</table>`)}
<div class="disc">${esc(E.disclaimer)}</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.open(); win.document.write(html); win.document.close();
  } else {
    // Popup blocked — fall back to a Blob download of the HTML (still saveable / printable).
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "MusicHabitat_Executive_Summary_FF.html";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}


// =============================================================================
// PAGE 5 DOCUMENT CENTER — VIEWER SYSTEM (replaces the old stub DocViewer)
// PDFDocViewer renders Term Sheet + Executive Summary as real PDFs; everything
// else renders via InPortalDocReader. DocViewer (bottom) routes each docId.
// =============================================================================
// ---- PDF source registry ----------------------------------------------------
// BACKEND HOOK: set each to a hosted PDF URL, e.g.
//   "https://www.musichabitat.com/docs/term-sheet.pdf"
// Or swap to a base64 data URI ("data:application/pdf;base64,...") to embed
// the bytes directly in the bundle. Until a source is set, the viewer shows a
// clean placeholder rather than a broken frame.
// When a hosted PDF URL is set for a doc, BOTH view and download use that file
// (view = download parity). Until then, view uses the rich in-portal reader and
// download generates a print-ready PDF from the same on-screen content.

export function pdfSourceKey(docId) {
  if (docId === "execsum") return "execsum";
  if (docId.startsWith("termsheet") || docId === "term_sheet") return "term_sheet";
  return docId;
}

// Generates a print-ready Term Sheet PDF in-browser from the canonical terms,
// used until a hosted signed PDF is set in DOC_SOURCES.term_sheet.
export function downloadTermSheetPDF() {
  if (DOC_SOURCES.term_sheet) { window.open(DOC_SOURCES.term_sheet, "_blank"); return; }
  const rows = [
    ["Issuer", "Music Habitat, Inc., a Montana corporation"],
    ["Round", "Friends & Family · The Circle 35"],
    ["Exemption", "Rule 506(b) of Regulation D — private offering, no general solicitation"],
    ["Eligible Investors", "Up to thirty-five (35) · pre-existing substantive relationships only"],
    ["Security", "Class B Preferred (priced track) and/or SAFE converting to Class B"],
    ["Pre-Money Valuation", "$10,000,000"],
    ["Total Shares Declared", "10,000,000 across Class A · B · C"],
    ["Share Price", "$1.00 per share (fixed)"],
    ["Warrant Coverage", "3× purchased shares at 95% of FMV"],
    ["Warrant Exercise", "Nine (9) months from grant date"],
    ["Minimum Investment", "$500 per investor"],
    ["Maximum Investment", "$25,000 per investor"],
    ["Aggregate Raise Target", "$250,000 (Circle 35 aggregate)"],
    ["Voting", "Class A: 15 votes/share (Founder) · Class B: 1 vote/share · Class C: none"],
    ["Pari Passu", "Class B pari passu with Class A on economic entitlements"],
    ["Information Rights", "Unaudited quarterly within 45 days · annual within 90 days"],
    ["Cap Table", "Company cap-table platform"],
    ["Governing Law", "State of Montana · AAA binding arbitration, Montana or Louisiana"],
  ];
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Music Habitat — Term Sheet (F&F · Circle 35)</title>
<style>
  @page { margin: 48px; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1f; margin: 0; padding: 32px; line-height: 1.5; }
  .mast { font-family: Arial, sans-serif; font-weight: 800; letter-spacing: 1px; font-size: 18px;
    border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 6px; }
  .mast .t { color: #00A9BD; } .mast .g { color: #D9A800; }
  .tag { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 2px; color: #888;
    text-transform: uppercase; margin-bottom: 14px; }
  h1 { font-size: 24px; margin: 0 0 6px; }
  .sub { color:#555; font-style: italic; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  td { padding: 8px 0; border-bottom: 1px solid #eee; vertical-align: top; }
  td.k { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    color: #888; width: 38%; padding-right: 14px; }
  .disc { font-size: 9px; color: #888; margin-top: 22px; border-top: 1px solid #ddd; padding-top: 10px; line-height: 1.4; }
  @media print { .noprint { display: none; } }
  .noprint { text-align:center; margin: 18px 0; }
  .noprint button { font-family: Arial; font-size: 14px; padding: 10px 22px; background: #D9A800;
    border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style></head><body>
<div class="noprint"><button onclick="window.print()">Save as PDF / Print</button></div>
<div class="mast"><span class="t">MUSIC</span><span class="g">HABITAT</span></div>
<div class="tag">Term Sheet · F&amp;F Round · The Circle 35 · Confidential</div>
<h1>Term Sheet</h1>
<div class="sub">Non-binding summary of proposed terms for discussion purposes only. Not an offer to sell securities; any offering is made solely through the definitive documents.</div>
<table>${rows.map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>
<div class="disc">CONFIDENTIAL. This Term Sheet is non-binding and for discussion purposes only. Governing law State of Montana; AAA binding arbitration in Montana or Louisiana. © 2026 Music Habitat, Inc.</div>
</body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.open(); win.document.write(html); win.document.close(); }
  else {
    const blob = new Blob([html], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = "MusicHabitat_TermSheet_FF.html";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
}

// =============================================================================
// PDFDocViewer — real PDF render with hosted-URL / data-URI hook
// =============================================================================

export function downloadReaderDoc(docId) {
  const key = resolveDocKey(docId);
  if (DOC_SOURCES[key]) { window.open(DOC_SOURCES[key], "_blank"); return; }

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const V = VERBATIM[key];
  const R = READER_CONTENT[key];
  const src = V || R;
  if (!src) { return; }

  let bodyHtml = "";
  if (V) {
    bodyHtml += (V.meta || []).length
      ? `<table class="meta">${V.meta.map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>` : "";
    bodyHtml += V.articles.map(([h, ...paras]) =>
      `<div class="art"><h2>${esc(h)}</h2>${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`).join("");
  } else {
    bodyHtml += `<div class="intro">${esc(R.intro)}</div>`;
    bodyHtml += (R.sections || []).map((s) => {
      let inner = `<h2>${esc(s.h)}</h2>`;
      if (s.body) inner += `<p>${esc(s.body)}</p>`;
      if (s.list) inner += s.list.map(([t, d]) => `<div class="item"><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join("");
      return `<div class="art">${inner}</div>`;
    }).join("");
    if (R.roster) bodyHtml += `<div class="art"><table class="meta">${R.roster.map(([n, role]) => `<tr><td><b>${esc(n)}</b></td><td style="text-align:right;color:#888">${esc(role)}</td></tr>`).join("")}</table></div>`;
    if (R.financials) bodyHtml += `<div class="art"><h2>${esc(R.financials.heading)}</h2><table class="grid"><tr>${R.financials.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${R.financials.rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="rl"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></div>`;
    if (R.ask) bodyHtml += `<div class="art"><h2>${esc(R.ask.heading)}</h2><table class="grid">${R.ask.items.map((it) => `<tr><td class="rl">${esc(it[0])}</td><td>${esc(it[1])}</td><td>${esc(it[2])}</td></tr>`).join("")}</table></div>`;
  }

  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Music Habitat — ${esc(src.title)}</title>
<style>
  @page { margin: 48px; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1f; margin: 0; padding: 32px; line-height: 1.55; }
  .mast { font-family: Arial, sans-serif; font-weight: 800; letter-spacing: 1px; font-size: 18px;
    border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 6px; }
  .mast .t { color: #00A9BD; } .mast .g { color: #D9A800; }
  .tag { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 2px; color: #888;
    text-transform: uppercase; margin-bottom: 14px; }
  h1 { font-size: 24px; margin: 0 0 12px; }
  h2 { font-size: 15px; margin: 18px 0 6px; font-family: Arial, sans-serif; }
  p { margin: 0 0 8px; font-size: 12.5px; }
  .intro { color: #555; font-style: italic; font-size: 13px; margin-bottom: 12px; }
  .art { page-break-inside: avoid; }
  .item { margin: 0 0 8px; } .item b { font-size: 12.5px; } .item p { color: #555; margin: 2px 0 0; }
  table.meta { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px; }
  table.meta td { padding: 5px 0; border-bottom: 1px solid #eee; }
  table.meta td.k { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #888; width: 40%; }
  table.grid { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
  table.grid th { text-align: right; font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #888; padding: 6px 8px; border-bottom: 1px solid #ddd; }
  table.grid td { text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee; }
  table.grid td.rl { text-align: left; }
  .disc { font-size: 9px; color: #888; margin-top: 22px; border-top: 1px solid #ddd; padding-top: 10px; line-height: 1.4; }
  @media print { .noprint { display: none; } }
  .noprint { text-align:center; margin: 18px 0; }
  .noprint button { font-family: Arial; font-size: 14px; padding: 10px 22px; background: #D9A800;
    border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style></head><body>
<div class="noprint"><button onclick="window.print()">Save as PDF / Print</button></div>
<div class="mast"><span class="t">MUSIC</span><span class="g">HABITAT</span></div>
<div class="tag">${esc(src.kicker || "Music Habitat")}</div>
<h1>${esc(src.title)}</h1>
${bodyHtml}
<div class="disc">${esc(src.note || "CONFIDENTIAL & PROPRIETARY — NOT FOR DISTRIBUTION. © 2026 Music Habitat, Inc.")}</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.open(); win.document.write(html); win.document.close(); }
  else {
    const blob = new Blob([html], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = `MusicHabitat_${src.title.replace(/[^a-z0-9]+/gi, "_")}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
}

// =============================================================================
// InPortalDocReader — renders a READER_CONTENT or VERBATIM doc in-app.
// VERBATIM (full legal text) takes priority when present for a docId.
// =============================================================================
