/**
 * Run a SQL migration file against DATABASE_URL.
 * Usage: node scripts/run-migration.mjs neon/migrations/004_user_role.sql
 */
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

const ROOT = process.cwd();

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-migration.mjs path/to/migration.sql");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const sql = neon(url);
const migration = fs.readFileSync(path.join(ROOT, file), "utf8");
await sql.unsafe(migration);
console.log(`Applied migration: ${file}`);
