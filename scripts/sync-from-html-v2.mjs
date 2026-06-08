/**
 * Sync src/portal from musichabitat-circle35-portal (1).html
 * Run: node scripts/sync-from-html-v2.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const HTML = path.join(ROOT, "musichabitat-circle35-portal (1).html");
const OUT = path.join(ROOT, "src", "portal");

const html = fs.readFileSync(HTML, "utf8");
const marker = '<script type="text/babel" data-presets="react">';
const start = html.indexOf(marker);
if (start === -1) throw new Error("babel script not found");
const contentStart = start + marker.length;
const end = html.indexOf("</script>", contentStart);
let body = html.slice(contentStart, end).trim();
body = body.replace(/^const \{ useState, useEffect, useRef \} = React;\s*\n/m, "");
body = body.replace(
  /\/\/ Mount\.[\s\S]*ReactDOM\.createRoot\(rootEl\)\.render\(React\.createElement\(App\)\);\s*$/,
  "",
).trim();

const lines = body.split("\n");

function findLine(re) {
  const idx = lines.findIndex((l) => re.test(l));
  if (idx === -1) throw new Error(`Pattern not found: ${re}`);
  return idx + 1;
}

function slice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join("\n");
}

function write(rel, content, header = "") {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, header + content.trimEnd() + "\n", "utf8");
  console.log(" ", rel);
}

function exportFunctions(text) {
  return text
    .replace(/^async function (\w+)/gm, "export async function $1")
    .replace(/^function (\w+)/gm, "export function $1");
}

function exportConsts(text) {
  return text.replace(/^const (\w+)/gm, "export const $1");
}

const bounds = {
  tokens: [findLine(/^const C =/), findLine(/^const FONT_BODY/)],
  shell: [findLine(/^function Shell/), findLine(/^function TopBar\(/)-1],
  topBar: [findLine(/^function TopBar/), findLine(/^const MH_LOGO_URL/) - 1],
  logo: [findLine(/^const MH_LOGO_URL/), findLine(/^function H\(/)-1],
  typography: [findLine(/^function H\(/), findLine(/^function Btn\(/)-1],
  button: [findLine(/^function Btn\(/), findLine(/^function Card\(/)-1],
  card: [findLine(/^function Card\(/), findLine(/^function Field\(/)-1],
  field: [findLine(/^function Field\(/), findLine(/^function Countdown\(/)-1],
  countdown: [findLine(/^function Countdown\(/), findLine(/^function BadgeMark\(/)-1],
  badge: [findLine(/^function BadgeMark\(/), findLine(/^const BRANDON_PHOTO/) - 1],
  photos: [findLine(/^const BRANDON_PHOTO/), findLine(/^function Avatar\(/)-1],
  avatar: [findLine(/^function Avatar\(/), findLine(/^const EXEC_SUMMARY/) - 1],
  content: [findLine(/^const EXEC_SUMMARY/), findLine(/^function Page1\(/)-1],
  page1: [findLine(/^function Page1\(/), findLine(/^function GatePage\(/)-1],
  gateStub: [findLine(/^function GatePage\(/), findLine(/^\/\/ NDA GATE/) - 1],
  ndaLib: [findLine(/^function ndaClauses/), findLine(/^function NDAGate\(/)-1],
  ndaGate: [findLine(/^function NDAGate\(/), findLine(/^function Page2\(/)-1],
  page2: [findLine(/^function Page2\(/), findLine(/^const CEO_VIDEO/) - 1],
  media: [findLine(/^const CEO_VIDEO/), findLine(/^function BrandonSignature/) - 1],
  brandonSig: [findLine(/^function BrandonSignature/), findLine(/^function Page3\(/)-1],
  page3: [findLine(/^function Page3\(/), findLine(/^function Page4\(/)-1],
  page4: [findLine(/^function Page4\(/), findLine(/^function Page5\(/)-1],
  page5: [findLine(/^function Page5\(/), findLine(/^function ExecSummaryView\(/)-1],
  execView: [findLine(/^function ExecSummaryView\(/), findLine(/^const HOSTED_EXEC/) - 1],
  pdfLib1: [findLine(/^function downloadExecSummaryPDF/), findLine(/^const DOC_SOURCES/) - 1],
  docSources: [findLine(/^const DOC_SOURCES/), findLine(/^function pdfSourceKey/) - 1],
  pdfLib2: [findLine(/^function pdfSourceKey/), findLine(/^function PDFDocViewer\(/)-1],
  pdfViewer: [findLine(/^function PDFDocViewer\(/), findLine(/^const READER_CONTENT/) - 1],
  readerContent: [findLine(/^const READER_CONTENT/), findLine(/^const READER_PENDING/) - 1],
  readerPending: [findLine(/^const READER_PENDING/), findLine(/^const VERBATIM/) - 1],
  verbatim: [findLine(/^const VERBATIM/), findLine(/^function downloadReaderDoc/) - 1],
  pdfLib3: [findLine(/^function downloadReaderDoc/), findLine(/^function InPortalDocReader\(/)-1],
  docAlias: [findLine(/^const DOC_ID_ALIAS/), findLine(/^function resolveDocKey/)],
  inPortalReader: [findLine(/^function InPortalDocReader\(/), findLine(/^const DOC_ID_ALIAS/) - 1],
  prototype: [findLine(/^function PrototypeView\(/), findLine(/^function DocViewer\(/)-1],
  docViewer: [findLine(/^function DocViewer\(/), findLine(/^function Page6\(/)-1],
  page6: [findLine(/^function Page6\(/), findLine(/^function Page7\(/)-1],
  page7: [findLine(/^function Page7\(/), findLine(/^function Page8\(/)-1],
  page8: [findLine(/^function Page8\(/), findLine(/^function Page9\(/)-1],
  page9: [findLine(/^function Page9\(/), findLine(/^function DocuSignMark\(/)-1],
  docusignMark: [findLine(/^function DocuSignMark\(/), findLine(/^const DOCUSIGN/) - 1],
  docusign: [findLine(/^const DOCUSIGN/), findLine(/^async function getDocusignSigningUrl/) - 1],
  getDocusign: [findLine(/^async function getDocusignSigningUrl/), findLine(/^function Page10\(/)-1],
  funding: [findLine(/^const FUNDING/), findLine(/^function Page11\(/)-1],
  page10: [findLine(/^function Page10\(/), findLine(/^const FUNDING/) - 1],
  page11: [findLine(/^function Page11\(/), findLine(/^const achLabel/) - 1],
  achLabelOnly: [findLine(/^const achLabel/), findLine(/^function achInput\(/)-1],
  achErrOnly: [findLine(/^const achErr/), findLine(/^const achErr/)+1],
  ach: [findLine(/^function achInput/), findLine(/^function GuardianBadge\(/)-1],
  guardian: [findLine(/^function GuardianBadge\(/), findLine(/^function StepNav\(/)-1],
  stepNav: [findLine(/^function StepNav\(/), findLine(/^const PRIVATE =/)-1],
  page12: [findLine(/^function Page12\(/), findLine(/^const CALENDLY_URL/) - 1],
  page13: [findLine(/^function Page13\(/), findLine(/^function StepNav\(/)-1],
  privateData: [findLine(/^const PRIVATE =/), findLine(/^function PPStep\(/)-1],
  ppStep: [findLine(/^function PPStep\(/), findLine(/^function PPWelcomeCEO\(/)-1],
  ppWelcomeCeo: [findLine(/^function PPWelcomeCEO\(/), findLine(/^function PPOverview\(/)-1],
  ppOverview: [findLine(/^function PPOverview\(/), findLine(/^function PPDocs\(/)-1],
  ppDocs: [findLine(/^function PPDocs\(/), findLine(/^function PPQA\(/)-1],
  ppQa: [findLine(/^function PPQA\(/), findLine(/^function PPApply\(/)-1],
  ppApply: [findLine(/^function PPApply\(/), findLine(/^function PPReserve\(/)-1],
  ppReserve: [findLine(/^function PPReserve\(/), findLine(/^function PPAck\(/)-1],
  ppAck: [findLine(/^function PPAck\(/), findLine(/^function PPSign\(/)-1],
  ppSign: [findLine(/^function PPSign\(/), findLine(/^function PPFund\(/)-1],
  ppFund: [findLine(/^function PPFund\(/), findLine(/^function PPWelcome\(/)-1],
  ppWelcome: [findLine(/^function PPWelcome\(/), findLine(/^function PPCall\(/)-1],
  ppCall: [findLine(/^function PPCall\(/), findLine(/^function App\(/)-1],
};

console.log("Syncing portal from updated HTML…");

const UI_HEADER = `"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

`;

write("tokens.ts", exportConsts(slice(...bounds.tokens)));
write("data/photos.ts", exportConsts(slice(...bounds.photos)));

write("data/content.ts", exportConsts(slice(...bounds.content)), `import { C } from "@/portal/tokens";\n\n`);

write("data/media.ts", exportConsts(slice(...bounds.media)));

write(
  "data/doc-config.ts",
  exportConsts(slice(...bounds.execView).match(/const HOSTED_EXEC_SUMMARY_URL[\s\S]*?;\n/)?.[0] || 'export const HOSTED_EXEC_SUMMARY_URL = "";\n') +
    "\n\n" +
    exportConsts(slice(...bounds.docSources)) +
    "\n\n" +
    exportConsts(slice(...bounds.docusign)) +
    "\n\n" +
    exportConsts(slice(...bounds.funding)) +
    `\n\nexport const CALENDLY_URL = "";\n`,
);

write("data/reader-content.ts", exportConsts(slice(...bounds.readerContent)));
write("data/reader-pending.ts", exportConsts(slice(...bounds.readerPending)));
write("data/verbatim.ts", exportConsts(slice(...bounds.verbatim)));
{
  const aliasBody = slice(...bounds.docAlias);
  let aliasOut = exportConsts(aliasBody);
  aliasOut = aliasOut.replace(/^function resolveDocKey/m, "export function resolveDocKey");
  write("data/doc-aliases.ts", aliasOut);
}
write("data/private-offering.ts", exportConsts(slice(...bounds.privateData)));

write(
  "lib/nda.ts",
  exportFunctions(slice(...bounds.ndaLib)),
);

write(
  "lib/pdf.ts",
  exportFunctions(slice(...bounds.pdfLib1)) +
    "\n\n" +
    exportFunctions(slice(...bounds.pdfLib2)) +
    "\n\n" +
    exportFunctions(slice(...bounds.pdfLib3)),
  `import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { HOSTED_EXEC_SUMMARY_URL, DOC_SOURCES, PDF_RENDER_IDS } from "@/portal/data/doc-config";
import { READER_CONTENT } from "@/portal/data/reader-content";
import { VERBATIM } from "@/portal/data/verbatim";
import { resolveDocKey } from "@/portal/data/doc-aliases";

`,
);

write(
  "lib/docusign.ts",
  exportFunctions(slice(...bounds.getDocusign)),
  `import { DOCUSIGN } from "@/portal/data/doc-config";
import type { InvestorApp } from "@/portal/types";

`,
);

write("lib/ach.ts", exportFunctions(slice(...bounds.ach)), `import { C } from "@/portal/tokens";\n\n`);
write(
  "data/ach-labels.ts",
  exportConsts(slice(...bounds.achLabelOnly)) + "\n" + exportConsts(slice(...bounds.achErrOnly)),
  `import { C, FONT_DISPLAY } from "@/portal/tokens";\n\n`,
);

write(
  "ui/Shell.tsx",
  exportFunctions(slice(...bounds.shell)) +
    "\n\n" +
    exportFunctions(slice(...bounds.topBar)),
  `"use client";

import { C, FONT_BODY, FONT_DISPLAY } from "@/portal/tokens";
import { Logo } from "@/portal/ui/Logo";

`,
);

{
  const logoBody = slice(...bounds.logo);
  let logoOut = exportConsts(logoBody);
  logoOut = logoOut.replace(/^function Logo/m, "export function Logo");
  write("ui/Logo.tsx", logoOut, UI_HEADER);
}
write("ui/Typography.tsx", exportFunctions(slice(...bounds.typography)), UI_HEADER);
write("ui/Button.tsx", exportFunctions(slice(...bounds.button)), UI_HEADER);
write("ui/Card.tsx", exportFunctions(slice(...bounds.card)), UI_HEADER);
write("ui/Field.tsx", exportFunctions(slice(...bounds.field)), UI_HEADER);
write("ui/Countdown.tsx", exportFunctions(slice(...bounds.countdown)), UI_HEADER);
write("ui/BadgeMark.tsx", exportFunctions(slice(...bounds.badge)), UI_HEADER);
write("ui/Avatar.tsx", exportFunctions(slice(...bounds.avatar)), UI_HEADER + `import { PHOTO_MAP, PHOTO_BASE } from "@/portal/data/photos";\n\n`);
write("ui/StepNav.tsx", exportFunctions(slice(...bounds.stepNav)), UI_HEADER);
write("ui/DocuSignMark.tsx", exportFunctions(slice(...bounds.docusignMark)), UI_HEADER);
write("ui/GuardianBadge.tsx", exportFunctions(slice(...bounds.guardian)), UI_HEADER);
write("ui/BrandonSignature.tsx", exportFunctions(slice(...bounds.brandonSig)), UI_HEADER);

write(
  "ui/PPStep.tsx",
  exportConsts(slice(...bounds.privateData).match(/const PP_TOTAL[\s\S]*?;\n/)?.[0] || "export const PP_TOTAL = 11;\n") +
    "\n\n" +
    exportFunctions(slice(...bounds.ppStep)),
  UI_HEADER,
);

const VIEW_HEADER = `"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell, TopBar } from "@/portal/ui/Shell";
import { Logo } from "@/portal/ui/Logo";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { Avatar } from "@/portal/ui/Avatar";

`;

write("views/ExecSummaryView.tsx", exportFunctions(slice(...bounds.execView)), VIEW_HEADER + `import { EXEC_SUMMARY } from "@/portal/data/content";\nimport { downloadExecSummaryPDF } from "@/portal/lib/pdf";\n\n`);
write("views/PDFDocViewer.tsx", exportFunctions(slice(...bounds.pdfViewer)), VIEW_HEADER + `import { downloadTermSheetPDF, pdfSourceKey } from "@/portal/lib/pdf";\nimport { DOC_SOURCES } from "@/portal/data/doc-config";\n\n`);
write("views/InPortalDocReader.tsx", exportFunctions(slice(...bounds.inPortalReader)), VIEW_HEADER + `import { READER_CONTENT } from "@/portal/data/reader-content";\nimport { READER_PENDING } from "@/portal/data/reader-pending";\nimport { VERBATIM } from "@/portal/data/verbatim";\nimport { DOC_SOURCES } from "@/portal/data/doc-config";\nimport { resolveDocKey } from "@/portal/data/doc-aliases";\nimport { downloadReaderDoc } from "@/portal/lib/pdf";\n\n`);
write("views/PrototypeView.tsx", exportFunctions(slice(...bounds.prototype)), VIEW_HEADER + `import { PROTOTYPE_IMAGES, PROTOTYPE_LIVE_URL } from "@/portal/data/doc-config";\n\n`);
write("views/DocViewer.tsx", exportFunctions(slice(...bounds.docViewer)), `"use client";\n\nimport { PDF_RENDER_IDS } from "@/portal/data/doc-config";\nimport { resolveDocKey } from "@/portal/data/doc-aliases";\nimport { PrototypeView } from "@/portal/views/PrototypeView";\nimport { PDFDocViewer } from "@/portal/views/PDFDocViewer";\nimport { InPortalDocReader } from "@/portal/views/InPortalDocReader";\n\n`);

const PAGE_HEADER = `// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { Field } from "@/portal/ui/Field";
import { Countdown } from "@/portal/ui/Countdown";
import { BadgeMark } from "@/portal/ui/BadgeMark";
import { Avatar } from "@/portal/ui/Avatar";
import { StepNav } from "@/portal/ui/StepNav";
import { DocuSignMark } from "@/portal/ui/DocuSignMark";
import { GuardianBadge } from "@/portal/ui/GuardianBadge";
import { BrandonSignature } from "@/portal/ui/BrandonSignature";
import { EXEC_SUMMARY, REFERRERS, DOC_CENTER, QA } from "@/portal/data/content";
import { PHOTO_MAP, PHOTO_BRANDON } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";
import { achLabel, achErr } from "@/portal/data/ach-labels";

`;

const PP_HEADER = PAGE_HEADER.replace(
  `import { EXEC_SUMMARY, REFERRERS, DOC_CENTER, QA } from "@/portal/data/content";`,
  `import { EXEC_SUMMARY, QA_PRIVATE } from "@/portal/data/content";
import { PRIVATE } from "@/portal/data/private-offering";
import { PPStep, PP_TOTAL } from "@/portal/ui/PPStep";`,
);

for (const [key, rel] of [
  ["page1", "pages/Page1.tsx"],
  ["page2", "pages/Page2.tsx"],
  ["page3", "pages/Page3.tsx"],
  ["page4", "pages/Page4.tsx"],
  ["page5", "pages/Page5.tsx"],
  ["page6", "pages/Page6.tsx"],
  ["page7", "pages/Page7.tsx"],
  ["page8", "pages/Page8.tsx"],
  ["page9", "pages/Page9.tsx"],
  ["page10", "pages/Page10.tsx"],
  ["page11", "pages/Page11.tsx"],
  ["page12", "pages/Page12.tsx"],
  ["page13", "pages/Page13.tsx"],
]) {
  write(rel, exportFunctions(slice(...bounds[key])), PAGE_HEADER);
}

write("pages/NDAGate.tsx", exportFunctions(slice(...bounds.ndaGate)), PAGE_HEADER + `import { ndaClauses, downloadNDA } from "@/portal/lib/nda";\n\n`);

for (const [key, rel] of [
  ["ppWelcomeCeo", "pages/private/PPWelcomeCEO.tsx"],
  ["ppOverview", "pages/private/PPOverview.tsx"],
  ["ppDocs", "pages/private/PPDocs.tsx"],
  ["ppQa", "pages/private/PPQA.tsx"],
  ["ppApply", "pages/private/PPApply.tsx"],
  ["ppReserve", "pages/private/PPReserve.tsx"],
  ["ppAck", "pages/private/PPAck.tsx"],
  ["ppSign", "pages/private/PPSign.tsx"],
  ["ppFund", "pages/private/PPFund.tsx"],
  ["ppWelcome", "pages/private/PPWelcome.tsx"],
  ["ppCall", "pages/private/PPCall.tsx"],
]) {
  write(rel, exportFunctions(slice(...bounds[key])), PP_HEADER);
}

console.log("Done. Re-wire GatePage, PortalProvider, PortalScreen, navigation.");
