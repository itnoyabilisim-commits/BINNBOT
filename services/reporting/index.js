// services/reporting/index.js
import http from "http";

const PORT = process.env.REPORTING_PORT || 8092;

// Bellekte execution listesi (MVP)
let executions = [];

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
  const winrate = wins / pnlNums.length;

  // günlük toplamlar
  const byDate = new Map();
  for (const e of list) {
    const d = (e.ts || e.created_at || "").toString().slice(0, 10) || "unknown";
    const v = Number(e.pnl) || 0;
    byDate.set(d, (byDate.get(d) || 0) + v);
  }
  const pnlDaily = Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, pnl]) => ({ date, pnl }));

  // max drawdown (basit yaklaşım: kümülatif PnL serisinden)
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

  // Özet (executions listesinden üret)
  if (req.url === "/summary" && req.method === "GET") {
    const summary = computeSummary(executions);
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
        res.writeHead(400, cors); res.end(JSON.stringify({ code: "BAD_REQUEST", message: "invalid JSON" }));
      }
    });
    return;
  }

  // Execution listesi getir
  if (req.url === "/execs" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(executions));
  }

  res.writeHead(404, cors);
  res.end("not found");
});

server.listen(PORT, () => console.log(`reporting service on :${PORT}`));
