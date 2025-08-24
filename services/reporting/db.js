// services/reporting/db.js
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/binnbot"
});

// tablo yoksa basitçe oluşturur
export async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      user_email TEXT,
      pnl NUMERIC,
      winrate NUMERIC,
      max_drawdown NUMERIC,
      created_at TIMESTAMP DEFAULT now()
    )
  `);
}

export async function insertReport(r) {
  await pool.query(
    "INSERT INTO reports (user_email, pnl, winrate, max_drawdown) VALUES ($1,$2,$3,$4)",
    [r.user_email, r.pnl, r.winrate, r.maxDrawdown]
  );
}

export async function getLatest() {
  const { rows } = await pool.query("SELECT * FROM reports ORDER BY created_at DESC LIMIT 10");
  return rows;
}
