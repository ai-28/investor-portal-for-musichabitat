/**
 * Create or update a portal admin user (portal_users table).
 * Usage: node scripts/create-admin.mjs email@example.com 'YourPassword'
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
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

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs email@example.com 'Password'");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const sql = neon(url);
const password_hash = await bcrypt.hash(password, 12);

const existing = await sql`
  SELECT id, email FROM portal_users WHERE email = ${email} LIMIT 1
`;

let userId;

if (existing[0]) {
  userId = existing[0].id;
  await sql`
    UPDATE portal_users
    SET password_hash = ${password_hash}, role = 'admin'
    WHERE email = ${email}
  `;
  console.log(`Updated password and admin role for existing user: ${email}`);
} else {
  userId = crypto.randomUUID();
  await sql`
    INSERT INTO portal_users (id, email, password_hash, role)
    VALUES (${userId}, ${email}, ${password_hash}, 'admin')
  `;
  console.log(`Created admin user: ${email}`);
}

console.log(`Admin role set on portal_users.`);
console.log(`Optional bootstrap: ADMIN_EMAILS=${email}`);
