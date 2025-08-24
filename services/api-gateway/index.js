import http from "http";
import { randomUUID } from "crypto";
import { readRobots, writeRobots } from "./storage.js";
import { login, verify, issueToken, verifyToken } from "./auth.js"; // ← refresh için eklendi
import { publishOrderRequested, sendExecutionToReporting } from "./events.js";

const SCANNER_URL   = process.env.SCANNER_URL   || "";
const REPORTING_URL = process.env.REPORTING_URL || "";

// yardımcılar
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

  // NEW: refresh endpoint
  if (req.url === "/auth/refresh" && req.method === "POST") {
    return parseBody(req, res, ({ refreshToken }) => {
      const payload = refreshToken ? verifyToken(refreshToken, "refresh") : null;
      if (!payload) return send(res, 401, { code: "UNAUTHORIZED", message: "invalid refresh token" });
      const accessToken = issueToken(payload.sub, 3600, "access");
      return send(res, 200, { accessToken, refreshToken, expiresIn: 3600 });
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

      // event publish (stub)
      publishOrderRequested({ robotId: r.id, symbol: r.symbol, side: r.side });

      // reporting'e dummy execution gönder (akış görünür olsun)
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

  // REPORTS /execs proxy
  if (req.url.startsWith("/reports/execs") && req.method === "GET") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    if (REPORTING_URL) {
      (async () => {
        const r = await safeFetch(`${REPORTING_URL}/execs`);
        return send(res, r.ok ? r.status : 502, r.json);
      })();
    } else {
      return send(res, 200, []); // dummy boş liste
    }
    return;
  }

  // ... (PATCH, DELETE, TESTS, SCANNER, REPORTS summary aynı kalıyor)

  send(res, 404, "not found");
});

server.listen(8080, () => console.log("api-gateway running on :8080"));
