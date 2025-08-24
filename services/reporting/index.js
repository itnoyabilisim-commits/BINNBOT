// services/reporting/index.js
import http from "http";
import { URL } from "url";

const PORT = process.env.REPORTING_PORT || 8092;

// Bellekte execution listesi (MVP)
let executions = [];

/** ISO (YYYY-MM-DD) → Date (00:00:00) */
function toStartDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // Günün başına sabitle
  d.setHours(0, 0, 0, 0);
  return d;
}

/** ISO (YYYY-MM-DD) → Date (23:59:59.999) */
function toEndDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // Günün sonuna sabitle
  d.setHours(23, 59, 59, 999);
  return d;
}

/** ts alanına göre from/to filtre uygular */
function byDateRange(list, fromIso, toIso) {
  const from = toStartDate(fromIso);
  const to = toEndDate(toIso);
  if (!from && !to) return list;

  return list.filter((e) => {
    const ts = new Date(e.ts || e.created_at || e.date || 0);
    const t = ts.getTime();
    if (Number.isNaN(t)) return false;
    if (from && t < from.getTime()) return false;
    if (to && t > to.getTime()) return false;
    return true;
  });
}

/** Günlük özet ve metrikleri executions listesinden üretir */
function computeSummary(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return { pnlTotal: 0, winrate: 0, maxDrawdown: 0, pnlDaily: [] };
  }

  // pnlTotal
  const pnlNums = list.map(e => Number(e.pnl) || 0);
  const pnlTotal = pnlNums.reduce((a, b) => a + b, 0);

  // winrate
  const wins = pnlNums.filter(n => n > 0).length;
  const winrate = pnlNums.length ? wins / pnlNums.length : 0;

  // günlük toplamlar
  const byDate = new Map();
  for (const e of list) {
    const d = (e.ts || e.created_at || "").toString().slice(0, 10) || "unknown";
    const v = Number(e.pnl) || 0;
    byDate.set(d, (byDate.get(d) || 0) + v);
  }
  const pnlDaily = Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, pnl]) => ({ date, pnl: Number(pnl.toFixed(2)) }));

  // max drawdown (basit: kümülatif PnL serisinden)
  let peak = 0, equity = 0, maxDD = 0;
  for (const v of pnlDaily.map(x => x.pnl)) {
    equity += v;
    if (equity > peak) peak = equity;
    const dd = peak > 0 ? (peak - equity) / peak : 0;
    if (dd > maxDD) maxDD = dd;
  }

  return {
    pnlTotal: Number(pnlTotal.toFixed(2)),
    winrate: Number(winrate.toFixed(4)),
    maxDrawdown: Number(maxDD.toFixed(4)),
    pnlDaily
  };
}

const server = http.createServer((req, res) => {
  const cors = { "Access-Control-Allow-Origin": "*" };

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      ...cors,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // Sağlık
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  // Özet (executions listesinden; from/to ile filtre)
  if (req.url.startsWith("/summary") && req.method === "GET") {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const from = u.searchParams.get("from"); // YYYY-MM-DD
    const to = u.searchParams.get("to");     // YYYY-MM-DD

    const filtered = byDateRange(executions, from, to);
    const summary = computeSummary(filtered);

    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(summary));
  }

  // Execution ekle
  if (req.url === "/execs" && req.method === "POST") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        // Beklenen alanlar: { robotId, symbol, side, qty, price, pnl, ts }
        data.ts = data.ts || new Date().toISOString();
        data.pnl = Number(data.pnl) || 0;
        executions.push(data);
        res.writeHead(201, { "Content-Type": "application/json", ...cors });
        res.end(JSON.stringify(data));
      } catch {
        res.writeHead(400, cors);
        res.end(JSON.stringify({ code: "BAD_REQUEST", message: "invalid JSON" }));
      }
    });
    return;
  }

  // Execution listesi getir (opsiyonel: from/to uygulanabilir)
  if (req.url.startsWith("/execs") && req.method === "GET") {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const from = u.searchParams.get("from");
    const to = u.searchParams.get("to");
    const filtered = byDateRange(executions, from, to);

    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(filtered));
  }

  res.writeHead(404, cors);
  res.end("not found");
});

server.listen(PORT, () => console.log(`reporting service on :${PORT}`));
