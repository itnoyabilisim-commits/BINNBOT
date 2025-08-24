// services/reporting/index.js
import http from "http";
import { URL } from "url";
import { init, isReady, insertExecution, getExecutions, getDailyPnL, getTotals } from "./db.js";

const PORT = process.env.REPORTING_PORT || 8092;

// Bellek modu (DATABASE_URL yoksa fallback)
let memExecs = [];

/** ISO 'YYYY-MM-DD' → Date bounds */
function toStart(iso) { if (!iso) return null; const d=new Date(iso); if (isNaN(d)) return null; d.setHours(0,0,0,0); return d; }
function toEnd(iso)   { if (!iso) return null; const d=new Date(iso); if (isNaN(d)) return null; d.setHours(23,59,59,999); return d; }
function filterMem(list, from, to) {
  const f = toStart(from), t = toEnd(to);
  return list.filter(e => {
    const ts = new Date(e.ts || e.created_at || 0).getTime();
    if (isNaN(ts)) return false;
    if (f && ts < f.getTime()) return false;
    if (t && ts > t.getTime()) return false;
    return true;
  });
}
function computeSummary(list) {
  if (!list.length) return { pnlTotal: 0, winrate: 0, maxDrawdown: 0, pnlDaily: [] };
  const pnlTotal = Number(list.reduce((a,b)=> a + (Number(b.pnl)||0), 0).toFixed(2));
  const wins = list.filter(x => Number(x.pnl) > 0).length;
  const winrate = list.length ? Number((wins / list.length).toFixed(4)) : 0;

  const byDate = new Map();
  for (const e of list) {
    const key = (e.ts || e.created_at || "").toString().slice(0,10) || "unknown";
    byDate.set(key, (byDate.get(key) || 0) + (Number(e.pnl)||0));
  }
  const pnlDaily = Array.from(byDate.entries())
    .sort((a,b)=> a[0].localeCompare(b[0]))
    .map(([date, pnl]) => ({ date, pnl: Number(pnl.toFixed(2)) }));

  // basit max DD
  let peak=0, eq=0, maxDD=0;
  for (const d of pnlDaily) {
    eq += d.pnl; if (eq>peak) peak=eq;
    const dd = peak>0 ? (peak-eq)/peak : 0; if (dd>maxDD) maxDD=dd;
  }
  return { pnlTotal, winrate, maxDrawdown: Number(maxDD.toFixed(4)), pnlDaily };
}

// DB init (varsa)
init().catch(err => console.error("[reporting] DB init error:", err));

const server = http.createServer(async (req, res) => {
  const cors = { "Access-Control-Allow-Origin": "*" };

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      ...cors,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // health
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  // summary (from/to destekli)
  if (req.url.startsWith("/summary") && req.method === "GET") {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const from = u.searchParams.get("from") || null; // YYYY-MM-DD
    const to   = u.searchParams.get("to")   || null;

    try {
      if (isReady()) {
        const daily = await getDailyPnL({ from, to }); // [{date,pnl}]
        const totals = await getTotals({ from, to });  // { pnlTotal, winrate }
        // maxDD'yi JS'de hesapla:
        let peak=0, eq=0, maxDD=0;
        for (const d of daily) {
          eq += Number(d.pnl)||0; if (eq>peak) peak=eq;
          const dd = peak>0 ? (peak-eq)/peak : 0; if (dd>maxDD) maxDD=dd;
        }
        const summary = {
          pnlTotal: Number(totals.pnlTotal.toFixed(2)),
          winrate: Number(totals.winrate.toFixed(4)),
          maxDrawdown: Number(maxDD.toFixed(4)),
          pnlDaily: daily
        };
        res.writeHead(200, { "Content-Type": "application/json", ...cors });
        return res.end(JSON.stringify(summary));
      } else {
        // bellek modu
        const filtered = filterMem(memExecs, from, to);
        const summary = computeSummary(filtered);
        res.writeHead(200, { "Content-Type": "application/json", ...cors });
        return res.end(JSON.stringify(summary));
      }
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json", ...cors });
      return res.end(JSON.stringify({ code:"DB_ERROR", message:String(e) }));
    }
  }

  // execs POST
  if (req.url === "/execs" && req.method === "POST") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", async () => {
      try {
        const data = JSON.parse(body || "{}");
        data.ts = data.ts || new Date().toISOString();
        data.pnl = Number(data.pnl) || 0;

        if (isReady()) {
          const saved = await insertExecution(data);
          res.writeHead(201, { "Content-Type": "application/json", ...cors });
          return res.end(JSON.stringify(saved));
        } else {
          memExecs.push(data);
          res.writeHead(201, { "Content-Type": "application/json", ...cors });
          return res.end(JSON.stringify(data));
        }
      } catch {
        res.writeHead(400, { "Content-Type": "application/json", ...cors });
        return res.end(JSON.stringify({ code:"BAD_REQUEST", message:"invalid JSON" }));
      }
    });
    return;
  }

  // execs GET (from/to + limit)
  if (req.url.startsWith("/execs") && req.method === "GET") {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const from = u.searchParams.get("from") || null;
    const to   = u.searchParams.get("to")   || null;
    const limit = Number(u.searchParams.get("limit") || 200);

    try {
      if (isReady()) {
        const rows = await getExecutions({ from, to, limit });
        res.writeHead(200, { "Content-Type": "application/json", ...cors });
        return res.end(JSON.stringify(rows));
      } else {
        const filtered = filterMem(memExecs, from, to).slice(-limit).reverse();
        res.writeHead(200, { "Content-Type": "application/json", ...cors });
        return res.end(JSON.stringify(filtered));
      }
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json", ...cors });
      return res.end(JSON.stringify({ code:"DB_ERROR", message:String(e) }));
    }
  }

  res.writeHead(404, cors);
  res.end("not found");
});

server.listen(PORT, () => console.log(`reporting service on :${PORT}`));
