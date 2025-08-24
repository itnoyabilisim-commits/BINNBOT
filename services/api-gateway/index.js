import http from "http";
import { randomUUID } from "crypto";
import { readRobots, writeRobots } from "./storage.js";
import { login, verify } from "./auth.js";

const SCANNER_URL   = process.env.SCANNER_URL   || "";
const REPORTING_URL = process.env.REPORTING_URL || "";

function send(res, code, data, headers = {}) {
  const h = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", ...headers };
  res.writeHead(code, h);
  res.end(typeof data === "string" ? data : JSON.stringify(data));
}
function parseBody(req, res, cb) {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    try { cb(JSON.parse(body || "{}")); }
    catch { send(res, 400, { code: "BAD_REQUEST", message: "invalid JSON" }); }
  });
}
async function safeFetch(url, init) {
  try {
    const r = await fetch(url, init);
    const t = await r.text();
    return { ok: r.ok, status: r.status, json: t ? JSON.parse(t) : null };
  } catch (e) {
    return { ok: false, status: 502, json: { code: "UPSTREAM_ERROR", message: String(e) } };
  }
}

// CORS preflight
function preflight(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  if (preflight(req, res)) return;

  // SYSTEM
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  // AUTH
  if (req.url === "/auth/login" && req.method === "POST") {
    return parseBody(req, res, ({ email, password }) => {
      try { return send(res, 200, login(email, password)); }
      catch (e) { return send(res, 400, { code: "BAD_REQUEST", message: e.message }); }
    });
  }

  // ROBOTS
  if (req.url === "/robots" && req.method === "GET") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    return send(res, 200, { items: readRobots() });
  }

  if (req.url === "/robots" && req.method === "POST") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    return parseBody(req, res, (body) => {
      if (!body.symbol) return send(res, 400, { code: "BAD_REQUEST", message: "symbol gerekli" });
      if (!["buy","sell","long","short"].includes(body.side)) return send(res, 400, { code: "BAD_REQUEST", message: "side hatalı" });
      if (body.market && !["spot","futures"].includes(body.market)) return send(res, 400, { code: "BAD_REQUEST", message: "market hatalı" });

      const r = {
        id: randomUUID(),
        name: body.name || "Robot",
        market: body.market || "spot",
        symbol: body.symbol,
        side: body.side,
        status: "active",
        schedule: body.schedule || { mode: "immediate" },
        params: body.params || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const list = readRobots(); list.push(r); writeRobots(list);
      return send(res, 201, r);
    });
  }

  if (req.url?.startsWith("/robots/") && req.method === "PATCH") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    const id = req.url.split("/")[2];
    return parseBody(req, res, (body) => {
      if (body.market && !["spot","futures"].includes(body.market)) return send(res, 400, { code: "BAD_REQUEST", message: "market hatalı" });
      if (body.side && !["buy","sell","long","short"].includes(body.side)) return send(res, 400, { code: "BAD_REQUEST", message: "side hatalı" });

      const list = readRobots(); const idx = list.findIndex(x => x.id === id);
      if (idx === -1) return send(res, 404, { code: "NOT_FOUND", message: "robot not found" });
      list[idx] = { ...list[idx], ...body, updatedAt: new Date().toISOString() };
      writeRobots(list); return send(res, 200, list[idx]);
    });
  }

  if (req.url?.startsWith("/robots/") && req.method === "DELETE") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    const id = req.url.split("/")[2];
    writeRobots(readRobots().filter(x => x.id !== id));
    res.writeHead(204, { "Access-Control-Allow-Origin": "*" }); return res.end();
  }

  // TESTS (dummy)
  if (req.url === "/tests/backtest/spot" && req.method === "POST") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    return parseBody(req, res, () => {
      return send(res, 200, {
        pnl: 1245.5, winrate: 0.62, maxDrawdown: 0.18,
        trades: [{ time: new Date().toISOString(), side: "buy", qty: 100, price: 42000, result: 50 }],
      });
    });
  }

  // SCANNER
  if (req.url === "/scanner/templates" && req.method === "GET") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    if (SCANNER_URL) {
      (async () => {
        const r = await safeFetch(`${SCANNER_URL}/templates`);
        return send(res, r.ok ? r.status : 502, r.json);
      })();
    } else {
      return send(res, 200, [
        { key: "trend-strong", name: "Güçlü Trend Coinler", market: "spot" },
        { key: "rsi-oversold", name: "RSI Düşük (Alım Fırsatı)", market: "spot" },
      ]);
    }
    return;
  }

  if (req.url === "/scanner/search" && req.method === "POST") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    if (SCANNER_URL) {
      return parseBody(req, res, async (body) => {
        const r = await safeFetch(`${SCANNER_URL}/search`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        return send(res, r.ok ? r.status : 502, r.json);
      });
    } else {
      return parseBody(req, res, () => {
        return send(res, 200, [
          { symbol: "BTCUSDT", change24h: 0.034, volume24h: 250000000, score: 0.82 },
          { symbol: "ETHUSDT", change24h: 0.028, volume24h: 180000000, score: 0.74 },
        ]);
      });
    }
  }

  // REPORTS
  if (req.url.startsWith("/reports/summary") && req.method === "GET") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    if (REPORTING_URL) {
      (async () => {
        const r = await safeFetch(`${REPORTING_URL}/summary`);
        return send(res, r.ok ? r.status : 502, r.json);
      })();
    } else {
      return send(res, 200, {
        pnlTotal: 42031, winrate: 0.61, maxDrawdown: 0.22,
        pnlDaily: [{ date: "2025-08-01", pnl: 1200 }, { date: "2025-08-02", pnl: -340 }],
      });
    }
    return;
  }

  send(res, 404, "not found");
});

server.listen(8080, () => console.log("api-gateway running on :8080"));
