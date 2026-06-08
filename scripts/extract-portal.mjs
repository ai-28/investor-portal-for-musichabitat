import fs from "fs";
import path from "path";

const htmlPath = path.join(process.cwd(), "musichabitat-circle35-portal (1).html");
const outPath = path.join(process.cwd(), "src", "components", "PortalApp.jsx");

const html = fs.readFileSync(htmlPath, "utf8");
const marker = '<script type="text/babel" data-presets="react">';
const start = html.indexOf(marker);
if (start === -1) throw new Error("babel script not found");
const contentStart = start + marker.length;
const end = html.indexOf("</script>", contentStart);
if (end === -1) throw new Error("script end not found");

let body = html.slice(contentStart, end).trim();

// Remove browser-only mount block.
body = body.replace(
  /\/\/ Mount\.[\s\S]*ReactDOM\.createRoot\(rootEl\)\.render\(React\.createElement\(App\)\);\s*$/,
  "",
).trim();

const header = `"use client";

import { useState, useEffect, useRef } from "react";

`;

// Replace React hooks destructuring from global.
body = body.replace(
  /^const \{ useState, useEffect, useRef \} = React;\s*\n/m,
  "",
);

// Export App as default.
body = body.replace(/^function App\(\)/m, "export default function PortalApp()");

// Next.js SSR: Countdown must not call Date.now() during initial render.
body = body.replace(
  /const \[t, setT\] = useState\(calc\(\)\);\s*\n\s*useEffect\(\(\) => \{\s*\n\s*const id = setInterval\(\(\) => setT\(calc\(\)\), 1000\);\s*\n\s*return \(\) => clearInterval\(id\);\s*\n\s*\}, \[\]\);\s*\n\s*if \(!t\) return \(/,
  `// Defer live values until after mount — Date.now() differs between SSR and hydration.
  const [t, setT] = useState(null);
  useEffect(() => {
    const tick = () => setT(calc());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  if (t === null) {
    return (
      <div aria-busy="true">
        <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: 1.5,
          textTransform: "uppercase", fontFamily: FONT_DISPLAY, marginBottom: 4 }}>
          Offering closes in
        </div>
        <div style={{ minHeight: 38 }} />
      </div>
    );
  }
  if (!t) return (`,
);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, header + body + "\n", "utf8");
console.log(`Wrote ${outPath} (${header.length + body.length} bytes)`);
