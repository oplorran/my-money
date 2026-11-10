import { getPool } from "./db";

/**
 * Stats do cloaker. Grava desfecho (allowed/blocked) por dia, motivo, país e
 * device num contador diário (idempotente por upsert). Alimenta o dashboard.
 */

let ensured = false;

export async function ensureCloakSchema(): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  if (ensured) return true;
  await p.query(`
    CREATE TABLE IF NOT EXISTS cloak_daily (
      date DATE NOT NULL,
      outcome VARCHAR(10) NOT NULL,
      reason VARCHAR(30) NOT NULL DEFAULT '-',
      country VARCHAR(4) NOT NULL DEFAULT '?',
      device VARCHAR(10) NOT NULL DEFAULT '?',
      n BIGINT NOT NULL DEFAULT 0,
      PRIMARY KEY (date, outcome, reason, country, device)
    );
  `);
  await p.query(`CREATE INDEX IF NOT EXISTS idx_cloak_daily_date ON cloak_daily (date DESC);`);
  // Lead perdido: clique com sinal de anúncio que foi pra white (canário).
  await p.query(`
    CREATE TABLE IF NOT EXISTS cloak_lost (
      id SERIAL PRIMARY KEY,
      reason VARCHAR(30),
      country VARCHAR(4),
      ip VARCHAR(64),
      ua TEXT,
      path TEXT,
      fbclid BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await p.query(`CREATE INDEX IF NOT EXISTS idx_cloak_lost_created ON cloak_lost (created_at DESC);`);
  // Fingerprints de COMPRADORES (aprendizado): país/device/hora de quem comprou.
  await p.query(`
    CREATE TABLE IF NOT EXISTS cloak_buyer_fp (
      id SERIAL PRIMARY KEY,
      country VARCHAR(4),
      device VARCHAR(10),
      hour_utc SMALLINT,
      utm_source VARCHAR(120),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  ensured = true;
  return true;
}

export async function recordCloak(args: {
  outcome: "allowed" | "blocked";
  reason?: string;
  country?: string;
  device?: string;
  lost?: { ip?: string; ua?: string; path?: string; fbclid?: boolean };
}): Promise<void> {
  const p = getPool();
  if (!p) return;
  try {
    await ensureCloakSchema();
    const reason = (args.reason || "-").slice(0, 30);
    const country = (args.country || "?").slice(0, 4).toUpperCase();
    const device = (args.device || "?").slice(0, 10);
    await p.query(
      `INSERT INTO cloak_daily (date, outcome, reason, country, device, n)
       VALUES (CURRENT_DATE, $1, $2, $3, $4, 1)
       ON CONFLICT (date, outcome, reason, country, device)
       DO UPDATE SET n = cloak_daily.n + 1`,
      [args.outcome, reason, country, device]
    );
    if (args.lost) {
      await p.query(
        `INSERT INTO cloak_lost (reason, country, ip, ua, path, fbclid)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [reason, country, (args.lost.ip || "").slice(0, 64), (args.lost.ua || "").slice(0, 400), (args.lost.path || "").slice(0, 200), !!args.lost.fbclid]
      );
    }
  } catch {
    /* nunca derruba o request por causa de stats */
  }
}

export async function recordBuyerFp(args: { country?: string; device?: string; utm_source?: string }): Promise<void> {
  const p = getPool();
  if (!p) return;
  try {
    await ensureCloakSchema();
    await p.query(
      `INSERT INTO cloak_buyer_fp (country, device, hour_utc, utm_source) VALUES ($1, $2, $3, $4)`,
      [(args.country || "?").slice(0, 4), (args.device || "?").slice(0, 10), new Date().getUTCHours(), (args.utm_source || "").slice(0, 120)]
    );
  } catch {
    /* noop */
  }
}
