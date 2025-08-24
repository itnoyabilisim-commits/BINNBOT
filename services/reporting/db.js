// services/reporting/db.js
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || ""; // örn: postgres://user:pass@localhost:5432/binnbot
let pool = null;

export async function init() {
  if (!DATABASE_URL) {
    console.warn("[reporting/db] DATABASE_URL yok; bellek modu kullanılacak.");
    return false;
  }
  pool = new Pool({ connectionString: DATABASE_URL });

  // tablo: executions
  await pool.query(`
    CREATE TABLE IF NOT EXISTS executions (
      id SERIAL PRIMARY KEY,
      robot_id TEXT,
      symbol   TEXT,
      side     TEXT,
      qty      NUMERIC,
      price    NUMERIC,
      pnl      NUMERIC,
      ts       TIMESTAMPTZ DEFAULT now()
    );
  `);

  console.log("[reporting/db] init OK");
  return true;
}

export function isReady() {
  return !!pool;
}

/** Execution ekle */
export async function insertExecution(e) {
  if (!pool) throw new Error("db not ready");
  const q = `
    INSERT INTO executions (robot_id, symbol, side, qty, price, pnl, ts)
    VALUES ($1,$2,$3,$4,$5,$6, COALESCE($7, now()))
    RETURNING robot_id, symbol, side, qty, price, pnl, ts
  `;
  const vals = [e.robotId, e.symbol, e.side, e.qty, e.price, e.pnl, e.ts || null];
  const { rows } = await pool.query(q, vals);
  return rows[0];
}

/** from/to'ya göre executions listele */
export async function getExecutions({ from, to, limit = 200 }) {
  if (!pool) throw new Error("db not ready");
  const where = [];
  const vals = [];
  if (from) { vals.push(from); where.push(`ts >= $${vals.length}`); }
  if (to)   { vals.push(to);   where.push(`ts <= $${vals.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const q = `
    SELECT robot_id AS "robotId", symbol, side, qty, price, pnl, ts
    FROM executions
    ${whereSql}
    ORDER BY ts DESC
    LIMIT ${Number(limit) || 200}
  `;
  const { rows } = await pool.query(q, vals);
  return rows;
}

/** Günlük PnL listesi (date, pnl) */
export async function getDailyPnL({ from, to }) {
  if (!pool) throw new Error("db not ready");
  const where = [];
  const vals = [];
  if (from) { vals.push(from); where.push(`ts >= $${vals.length}`); }
  if (to)   { vals.push(to);   where.push(`ts <= $${vals.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const q = `
    SELECT to_char(date_trunc('day', ts), 'YYYY-MM-DD') AS date,
           SUM(pnl)::float AS pnl
    FROM executions
    ${whereSql}
    GROUP BY 1
    ORDER BY 1
  `;
  const { rows } = await pool.query(q, vals);
  return rows; // [{ date, pnl }]
}

/** Toplam PnL ve winrate */
export async function getTotals({ from, to }) {
  if (!pool) throw new Error("db not ready");
  const where = [];
  const vals = [];
  if (from) { vals.push(from); where.push(`ts >= $${vals.length}`); }
  if (to)   { vals.push(to);   where.push(`ts <= $${vals.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const q = `
    SELECT COALESCE(SUM(pnl),0)::float AS pnl_total,
           CASE WHEN COUNT(*)=0 THEN 0
                ELSE (SUM(CASE WHEN pnl>0 THEN 1 ELSE 0 END)::float / COUNT(*)) END AS winrate
    FROM executions
    ${whereSql}
  `;
  const { rows } = await pool.query(q, vals);
  return { pnlTotal: rows[0].pnl_total, winrate: rows[0].winrate };
}
