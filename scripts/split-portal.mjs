/**
 * Splits src/components/PortalApp.jsx into src/portal/* modules.
 * Run: node scripts/split-portal.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src", "components", "PortalApp.jsx");
const OUT = path.join(ROOT, "src", "portal");

const lines = fs.readFileSync(SRC, "utf8").split("\n");

function slice(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

function write(rel, body, header = "") {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, header + body.trimEnd() + "\n", "utf8");
  console.log("  ", rel);
}

function exportFunctions(body) {
  return body.replace(/^function (\w+)/gm, "export function $1");
}

function exportConsts(body) {
  return body.replace(/^const (\w+)/gm, "export const $1");
}

console.log("Splitting portal…");

// --- tokens ---
write("tokens.ts", exportConsts(slice(31, 49)));

// --- data ---
write(
  "data/photos.ts",
  exportConsts(slice(287, 318)),
);

write("data/content.ts", exportConsts(slice(355, 504)));

write(
  "data/media.ts",
  exportConsts(slice(691, 696)),
);

write(
  "data/doc-config.ts",
  exportConsts(slice(1352, 1353)) +
    "\n\n" +
    exportConsts(slice(1446, 1480)) +
    "\n\n" +
    exportConsts(slice(3131, 3135)) +
    "\n\n" +
    exportConsts(slice(3227, 3228)) +
    "\n\n" +
    exportConsts(slice(3569, 3569)),
);

write("data/reader-content.ts", exportConsts(slice(1632, 1962)));

write(
  "data/reader-pending.ts",
  exportConsts(slice(1963, 1972)),
);

write("data/verbatim.ts", exportConsts(slice(1973, 2637)));

write(
  "data/doc-aliases.ts",
  exportConsts(slice(2638, 2645)) +
    "\n\n" +
    exportFunctions(slice(2646, 2646)),
);

write(
  "data/ach-labels.ts",
  exportConsts(slice(3461, 3472)),
);

// --- ui ---
const UI_HEADER = `"use client";

import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

`;

write(
  "ui/Shell.tsx",
  exportFunctions(slice(53, 64)) +
    "\n\n" +
    exportFunctions(slice(66, 88)),
  UI_HEADER,
);

write(
  "ui/Logo.tsx",
  exportConsts(slice(94, 94)) +
    "\n\n" +
    exportFunctions(slice(96, 132)),
  UI_HEADER,
);

write("ui/Typography.tsx", exportFunctions(slice(134, 152)), UI_HEADER);
write("ui/Button.tsx", exportFunctions(slice(154, 169)), UI_HEADER);
write("ui/Card.tsx", exportFunctions(slice(171, 180)), UI_HEADER);
write("ui/Field.tsx", exportFunctions(slice(182, 196)), UI_HEADER);
write("ui/Countdown.tsx", exportFunctions(slice(198, 254)),
  UI_HEADER.replace(
    'import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";',
    'import { useState, useEffect } from "react";\nimport { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";',
  ));
write("ui/BadgeMark.tsx", exportFunctions(slice(256, 284)), UI_HEADER);

write(
  "ui/Avatar.tsx",
  exportFunctions(slice(320, 353)),
  UI_HEADER.replace(
    'import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";',
    'import { useState } from "react";\nimport { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";',
  ) + `import { PHOTO_MAP, PHOTO_BASE } from "@/portal/data/photos";\n\n`,
);

write("ui/StepNav.tsx", exportFunctions(slice(3610, 3622)), UI_HEADER);
write("ui/DocuSignMark.tsx", exportFunctions(slice(3118, 3154)), UI_HEADER);
write("ui/GuardianBadge.tsx", exportFunctions(slice(3477, 3508)), UI_HEADER);
write("ui/BrandonSignature.tsx", exportFunctions(slice(701, 728)),
  UI_HEADER.replace(
    'import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";',
    'import { useEffect } from "react";\nimport { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";',
  ));

// Shell needs TopBar + Logo — patch Shell imports
const shellPath = path.join(OUT, "ui/Shell.tsx");
let shell = fs.readFileSync(shellPath, "utf8");
shell = shell.replace(
  UI_HEADER.trim(),
  `"use client";

import { C, FONT_BODY, FONT_DISPLAY } from "@/portal/tokens";
import { Logo } from "@/portal/ui/Logo";

`,
);
fs.writeFileSync(shellPath, shell);

// --- lib ---
write(
  "lib/pdf.ts",
  exportFunctions(slice(1356, 1445)) +
    "\n\n" +
    exportFunctions(slice(1484, 1560)) +
    "\n\n" +
    exportFunctions(slice(2378, 2455)),
  `import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { HOSTED_EXEC_SUMMARY_URL, DOC_SOURCES, PDF_RENDER_IDS } from "@/portal/data/doc-config";
import { READER_CONTENT } from "@/portal/data/reader-content";
import { VERBATIM } from "@/portal/data/verbatim";
import { resolveDocKey } from "@/portal/data/doc-aliases";

`,
);

write("lib/ach.ts", exportFunctions(slice(3465, 3475)), `import { C } from "@/portal/tokens";\n\n`);

// --- views ---
const VIEW_HEADER = `"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell, TopBar } from "@/portal/ui/Shell";
import { Logo } from "@/portal/ui/Logo";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";

`;

write(
  "views/ExecSummaryView.tsx",
  exportFunctions(slice(1162, 1351)),
  VIEW_HEADER +
    `import { EXEC_SUMMARY } from "@/portal/data/content";
import { downloadExecSummaryPDF } from "@/portal/lib/pdf";

`,
);

write(
  "views/PDFDocViewer.tsx",
  exportFunctions(slice(1561, 1625)),
  VIEW_HEADER +
    `import { downloadTermSheetPDF, pdfSourceKey } from "@/portal/lib/pdf";
import { DOC_SOURCES } from "@/portal/data/doc-config";

`,
);

write(
  "views/InPortalDocReader.tsx",
  exportFunctions(slice(2461, 2635)),
  VIEW_HEADER +
    `import { READER_CONTENT } from "@/portal/data/reader-content";
import { READER_PENDING } from "@/portal/data/reader-pending";
import { VERBATIM } from "@/portal/data/verbatim";
import { DOC_SOURCES } from "@/portal/data/doc-config";
import { resolveDocKey } from "@/portal/data/doc-aliases";
import { downloadReaderDoc } from "@/portal/lib/pdf";

`,
);

write(
  "views/PrototypeView.tsx",
  exportFunctions(slice(2651, 2728)) +
    "\n\n" +
    exportFunctions(slice(2729, 2737)),
  VIEW_HEADER +
    `import { PROTOTYPE_IMAGES, PROTOTYPE_LIVE_URL } from "@/portal/data/doc-config";

`,
);

write(
  "views/DocViewer.tsx",
  exportFunctions(slice(2742, 2753)),
  `"use client";

import { PDF_RENDER_IDS } from "@/portal/data/doc-config";
import { resolveDocKey } from "@/portal/data/doc-aliases";
import { PrototypeView } from "@/portal/views/PrototypeView";
import { PDFDocViewer } from "@/portal/views/PDFDocViewer";
import { InPortalDocReader } from "@/portal/views/InPortalDocReader";

`,
);

// --- pages ---
const PAGE_HEADER = `"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { Logo } from "@/portal/ui/Logo";
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
import { PHOTO_MAP, BRANDON_PHOTO } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";
import { achLabel, achErr } from "@/portal/data/ach-labels";

`;

const pageFiles = [
  ["pages/Page1.tsx", 506, 577],
  ["pages/GatePage.tsx", 578, 611],
  ["pages/Page2.tsx", 612, 690],
  ["pages/Page3.tsx", 730, 852],
  ["pages/Page4.tsx", 853, 1082],
  ["pages/Page5.tsx", 1083, 1161],
  ["pages/Page6.tsx", 2759, 2930],
  ["pages/Page7.tsx", 2931, 3006],
  ["pages/Page8.tsx", 3007, 3068],
  ["pages/Page9.tsx", 3069, 3117],
  ["pages/Page10.tsx", 3155, 3238],
  ["pages/Page11.tsx", 3239, 3460],
  ["pages/Page12.tsx", 3510, 3570],
  ["pages/Page13.tsx", 3571, 3605],
];

for (const [rel, start, end] of pageFiles) {
  write(rel, exportFunctions(slice(start, end)), PAGE_HEADER);
}

// GatePage only needs subset — trim imports later if needed

// --- ui barrel ---
write(
  "ui/index.ts",
  `export { Shell, TopBar } from "./Shell";
export { Logo } from "./Logo";
export { H, Kicker } from "./Typography";
export { Btn } from "./Button";
export { Card } from "./Card";
export { Field } from "./Field";
export { Countdown } from "./Countdown";
export { BadgeMark } from "./BadgeMark";
export { Avatar } from "./Avatar";
export { StepNav } from "./StepNav";
export { DocuSignMark } from "./DocuSignMark";
export { GuardianBadge } from "./GuardianBadge";
export { BrandonSignature } from "./BrandonSignature";
`,
);

// --- navigation ---
write(
  "navigation.ts",
  `/** Maps internal route keys (legacy) to Next.js paths. */
export const ROUTE_PATHS = {
  page1: "/",
  gate_ff: "/gate/friends-family",
  gate_private: "/gate/private",
  page_private: "/private-offering",
  execsum_reader: "/exec-summary",
  page2: "/step/2",
  page3: "/step/3",
  page4: "/step/4",
  page5: "/step/5",
  page6: "/step/6",
  page7: "/step/7",
  page8: "/step/8",
  page9: "/step/9",
  page10: "/step/10",
  page11: "/step/11",
  page12: "/step/12",
  page13: "/step/13",
};

export function pathToRoute(pathname) {
  if (!pathname || pathname === "/") return "page1";
  if (pathname === "/exec-summary") return "execsum_reader";
  if (pathname === "/private-offering") return "page_private";
  if (pathname === "/gate/friends-family") return "gate_ff";
  if (pathname === "/gate/private") return "gate_private";
  const doc = pathname.match(/^\\/docs\\/(.+)$/);
  if (doc) return \`doc_view:\${doc[1]}\`;
  const step = pathname.match(/^\\/step\\/(\\d+)$/);
  if (step) return \`page\${step[1]}\`;
  return "page1";
}

export function routeToPath(route) {
  if (route.startsWith("doc_view:")) {
    return \`/docs/\${route.slice("doc_view:".length)}\`;
  }
  return ROUTE_PATHS[route] ?? "/";
}
`,
);

console.log("Done. Run build to verify imports.");
