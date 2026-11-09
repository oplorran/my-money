import { Pool } from "pg";

/**
 * Pool Postgres (Render). Usa DATABASE_URL (interno na mesma região = rápido).
 * A tabela `leads` é garantida no primeiro uso (idempotente).
 *
 * Env:
 *   DATABASE_URL   connection string do Postgres (Render → Internal/External)
 */

let pool: Pool | null = null;
let ensured = false;

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      // Render externo exige SSL; interno aceita. rejectUnauthorized:false cobre os dois.
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function ensureSchema(): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  if (ensured) return true;
  await p.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      first_name VARCHAR(120),
      funnel VARCHAR(60),
      event VARCHAR(60),
      utm_source VARCHAR(120),
      utm_medium VARCHAR(120),
      utm_campaign VARCHAR(160),
      utm_content VARCHAR(160),
      utm_term VARCHAR(160),
      fbc VARCHAR(255),
      fbp VARCHAR(255),
      fbclid VARCHAR(255),
      ip VARCHAR(64),
      user_agent TEXT,
      page_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await p.query(`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (LOWER(email));`);
  await p.query(`CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);`);
  ensured = true;
  return true;
}
