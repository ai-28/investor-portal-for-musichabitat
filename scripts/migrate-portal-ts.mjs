import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src", "portal");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".jsx")) {
      fs.renameSync(full, full.replace(/\.jsx$/, ".tsx"));
      console.log("  .jsx → .tsx", path.relative(ROOT, full));
    } else if (entry.name.endsWith(".js")) {
      fs.renameSync(full, full.replace(/\.js$/, ".ts"));
      console.log("  .js → .ts", path.relative(ROOT, full));
    }
  }
}

console.log("Migrating src/portal to TypeScript…");
walk(ROOT);
console.log("Done.");
