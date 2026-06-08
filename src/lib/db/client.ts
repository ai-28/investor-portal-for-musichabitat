import { neon } from "@neondatabase/serverless";

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL. Add your Neon connection string to .env");
  }
  return neon(url);
}
