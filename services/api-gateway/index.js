import http from "http";
import { randomUUID } from "crypto";
import { readRobots, writeRobots } from "./storage.js";
import { login, verify, issueToken, verifyToken } from "./auth.js";
import { publishOrderRequested, sendExecutionToReporting } from "./events.js";

const SCANNER_URL   = process.env.SCANNER_URL   || "";
const REPORTING_URL = process.env.REPORTING_URL || "";

// ==== rate limit (dakikada N) ====
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 60);
const WINDOW_MS  = 60_000;
const rlMap = new Map(); // ip -> { count, start }

function rateLimit(req, res) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();
  const now = Date.now();
  const entry = rlMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 0; entry.start = now; }
  entry.count += 1;
  rlMap.set(ip, entry);
  if (entry.count > RATE_LIMIT) {
    res.writeHead(429, {
      "Content-Type": "application/json",
      "Retry-After": "60",
      "Access-Control-Allow-Origin": "*"
    });
    res.end(JSON.stringify({ code: "RATE_LIMIT", message: "Too many requests, please retry later." }));
    return false;
  }
  return true;
}

// ==== yardımcılar ====
function send(res, code, data, headers = {}) {
  const h = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", ...headers };
  res.writeHead(code, h);
  res.end(typeof data === "string" ? data : JSON.stringify(data));
}

function error(res, code, message, status = 400, headers = {}) {
  return send(res, status, { code, message }, headers);
}

function parseBody(req, res, cb) {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    try { cb(JSON.parse(body || "{}")); }
    catch { return error(res, "BAD_REQUEST", "invalid JSON", 400); }
  });
}

async function safeFetch(url, init) {
  try {
    const r = await fetch(url, init);
    let json = null;
    const text = await r.text();
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    if (!r.ok) return { ok: false, status: r.status, json: json || { code: "UPSTREAM_ERROR" } };
    return { ok: true, status: r.status, json };
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

  // ==== RATE LIMIT ====
  if (!rateLimit(req, res)) return;

  // SYSTEM
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  // AUTH
  if (req.url === "/auth/login" && req.method === "POST") {
    return parseBody(req, res, ({ email, password }) => {
      try { return send(res, 200, login(email, password)); }
      catch (e) { return error(res, "BAD_REQUEST", e.message || "login failed", 400); }
    });
  }

  if (req.url === "/auth/refresh" && req.method === "POST") {
    return parseBody(req, res, ({ refreshToken }) => {
      const payload = refreshToken ? verifyToken(refreshToken, "refresh") : null;
      if (!payload) return error(res, "UNAUTHORIZED", "invalid refresh token", 401);
      const accessToken = issueToken(payload.sub, 3600, "access");
      return send(res, 200, { accessToken, refreshToken, expiresIn: 3600 });
    });
  }

  // ROBOTS
  if (req.url === "/robots" && req.method === "GET") {
    const user = verify(req); if (!user) return error(res, "UNAUTHORIZED", "auth required", 401);
    return send(res, 200, { items: readRobots() });
  }

  if (req.url === "/robots" && req.method === "POST") {
    const user = verify(req); if (!user) return error(res, "UNAUTHORIZED", "auth required", 401);
    return parseBody(req, res, (body) => {
      if (!body.symbol) return error(res, "BAD_REQUEST", "symbol gerekli", 400);
      if (!["buy","sell","long","short"].includes(body.side)) return error(res, "BAD_REQUEST", "side hatalı", 400);
      if (body.market && !["spot","futures"].includes(body.market)) return error(res, "BAD_REQUEST", "market hatalı", 400);

      const r = {
        id: randomUUID(),
        name: body.name || `Robot – ${body.symbol || "SYMBOL"} – ${body.side || "side"}`,
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

      publishOrderRequested({ robotId: r.id, symbol: r.symbol, side: r.side });
      sendExecutionToReporting({
        robotId: r.id,
        symbol: r.symbol,
        side: r.side,
        qty: 100,
        price: 42000,
        pnl: (Math.random() * 200 - 100).toFixed(2),
        ts: new Date().toISOString()
      });

      return send(res, 201, r);
    });
  }

  // ROBOTS {id} PATCH
  if (req.url?.startsWith("/robots/") && req.method === "PATCH") {
    const user = verify(req); if (!user) return error(res, "UNAUTHORIZED", "auth required", 401);
    const id = req.url.split("/")[2];

    return parseBody(req, res, (body) => {
      if (body.market && !["spot","futures"].includes(body.market)) return error(res, "BAD_REQUEST", "market hatalı", 400);
      if (body.side && !["buy","sell","long","short"].includes(body.side)) return error(res, "BAD_REQUEST", "side hatalı", 400);
      if (body.status && !["active","paused","stopped"].includes(body.status)) return error(res, "BAD_REQUEST", "status hatalı", 400);
      if (body.schedule) {
        const mode = body.schedule.mode || "immediate";
        if (!["immediate","window","absolute"].includes(mode)) return error(res, "BAD_REQUEST", "schedule.mode hatalı", 400);
        if (mode === "window") {
          const w = body.schedule.window || {};
          if (!w.start || !w.end) return error(res, "BAD_REQUEST", "schedule.window.start/end gerekli", 400);
        }
        if (mode === "absolute") {
          if (!body.schedule.startAt && !body.schedule.stopAt) return error(res, "BAD_REQUEST", "schedule.startAt veya schedule.stopAt gerekli", 400);
        }
      }

      const list = readRobots();
      const idx = list.findIndex(x => x.id === id);
      if (idx === -1) return error(res, "NOT_FOUND", "robot not found", 404);

      list[idx] = { ...list[idx], ...body, updatedAt: new Date().toISOString() };
      writeRobots(list);
      return send(res, 200, list[idx]);
    });
  }

  // ROBOTS {id} DELETE
  if (req.url?.startsWith("/robots/") && req.method === "DELETE") {
    const user = verify(req); if (!user) return error(res, "UNAUTHORIZED", "auth required", 401);
    const id = req.url.split("/")[2];
    const list = readRobots();
    const exists = list.some(x => x.id === id);
    if (!exists) return error(res, "NOT_FOUND", "robot not found", 404);
    writeRobots(list.filter(x => x.id !== id));
    res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
    return res.end();
  }

  // REPORTS /execs proxy (from/to passthrough)
  if (req.url.startsWith("/reports/execs") && req.method === "GET") {
    const user = verify(req); if (!user) return error(res, "UNAUTHORIZED", "auth required", 401);
    if (REPORTING_URL) {
      (async () => {
        const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
        const r = await safeFetch(`${REPORTING_URL}/execs${qs}`);
        return send(res, r.ok ? r.status : 502, r.json);
      })(); return;
    } else {
      return send(res, 200, []);
    }
  }

  // REPORTS /summary proxy (from/to passthrough)
  if (req.url.startsWith("/reports/summary") && req.method === "GET") {
    const user = verify(req); if (!user) return error(res, "UNAUTHORIZED", "auth required", 401);
    if (REPORTING_URL) {
      (async () => {
        const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
        const r = await safeFetch(`${REPORTING_URL}/summary${qs}`);
        return send(res, r.ok ? r.status : 502, r.json);
      })(); return;
    } else {
      return send(res, 200, {
        pnlTotal: 42031, winrate: 0.61, maxDrawdown: 0.22,
        pnlDaily: [{ date: "2025-08-01", pnl: 1200 }, { date: "2025-08-02", pnl: -340 }],
      });
    }
  }

  // SCANNER templates
  if (req.url === "/scanner/templates" && req.method === "GET") {
    const user = verify(req); if (!user) return error(res, "UNAUTHORIZED", "auth required", 401);
    if (SCANNER_URL) {
      (async () => {
        const r = await safeFetch(`${SCANNER_URL}/templates`);
        return send(res, r.ok ? r.status : 502, r.json);
      })(); return;
    } else {
      return send(res, 200, [
        { key: "trend-strong", name: "Güçlü Trend Coinler", market: "spot" },
        { key: "rsi-oversold", name: "RSI Düşük (Alım Fırsatı)", market: "spot" },
      ]);
    }
  }

  // SCANNER search (template VEYA rules zorunlu)
  if (req.url === "/scanner/search" && req.method === "POST") {
    const user = verify(req); if (!user) return error(res, "UNAUTHORIZED", "auth required", 401);

    return parseBody(req, res, async (body) => {
      const { template, rules } = body || {};
      const hasTemplate = typeof template === "string" && template.length > 0;
      const hasRules = Array.isArray(rules) && rules.length > 0;

      if (!hasTemplate && !hasRules) {
        return error(
          res,
          "BAD_REQUEST",
          "template veya rules zorunlu (en az biri). Örn: { template: 'trend-strong' } veya { rules: [...] }",
          400
        );
      }

      if (SCANNER_URL) {
        const r = await safeFetch(`${SCANNER_URL}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        return send(res, r.ok ? r.status : 502, r.json);
      } else {
        return send(res, 200, [
          { symbol: "BTCUSDT", change24h: 0.034, volume24h: 250000000, score: 0.82 },
          { symbol: "ETHUSDT", change24h: 0.028, volume24h: 180000000, score: 0.74 },
        ]);
      }
    });
  }

  // fallback
  return error(res, "NOT_FOUND", "not found", 404);
});

server.listen(8080, () => console.log("api-gateway running on :8080"));
