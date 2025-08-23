// services/api-gateway/index.js
import http from "http";
import { randomUUID } from "crypto";
import { readRobots, writeRobots } from "./storage.js";

// Basit helperlar
function send(res, code, data, headers = {}) {
  const h = { "Content-Type": "application/json", ...headers };
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

// (İsteğe bağlı) çok basit “Bearer” kontrolü — şimdilik dummy
function authOk(req) {
  const h = req.headers["authorization"] || "";
  // prod'da gerçek JWT doğrulaması olacak; şimdilik opsiyonel:
  return true || h.startsWith("Bearer ");
}

const server = http.createServer((req, res) => {
  // CORS (geliştirmede iş kolaylık)
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }
  const cors = { "Access-Control-Allow-Origin": "*" };

  // Liveness
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200);
    return res.end("ok");
  }

  // -------- AUTH (dummy) --------
  if (req.url === "/auth/login" && req.method === "POST") {
    return parseBody(req, res, ({ email, password }) => {
      if (!email || !password) return send(res, 400, { code: "BAD_REQUEST", message: "email/password required" }, cors);
      return send(res, 200, { accessToken: randomUUID(), refreshToken: randomUUID(), expiresIn: 3600 }, cors);
    });
  }
  if (req.url === "/auth/refresh" && req.method === "POST") {
    return parseBody(req, res, ({ refreshToken }) => {
      if (!refreshToken) return send(res, 401, { code: "UNAUTHORIZED", message: "missing refresh token" }, cors);
      return send(res, 200, { accessToken: randomUUID(), refreshToken, expiresIn: 3600 }, cors);
    });
  }

  // -------- ROBOTS (kalıcı) --------
  if (req.url === "/robots" && req.method === "GET") {
    if (!authOk(req)) return send(res, 401, { code: "UNAUTHORIZED" }, cors);
    const items = readRobots();
    return send(res, 200, { items }, cors);
  }

  if (req.url === "/robots" && req.method === "POST") {
    if (!authOk(req)) return send(res, 401, { code: "UNAUTHORIZED" }, cors);
    return parseBody(req, res, (body) => {
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
      if (!r.symbol || !r.side) return send(res, 400, { code: "BAD_REQUEST", message: "symbol/side required" }, cors);
      const list = readRobots();
      list.push(r);
      writeRobots(list);
      return send(res, 201, r, cors);
    });
  }

  if (req.url?.startsWith("/robots/") && req.method === "PATCH") {
    if (!authOk(req)) return send(res, 401, { code: "UNAUTHORIZED" }, cors);
    const id = req.url.split("/")[2];
    return parseBody(req, res, (body) => {
      const list = readRobots();
      const idx = list.findIndex((x) => x.id === id);
      if (idx === -1) return send(res, 404, { code: "NOT_FOUND", message: "robot not found" }, cors);
      list[idx] = { ...list[idx], ...body, updatedAt: new Date().toISOString() };
      writeRobots(list);
      return send(res, 200, list[idx], cors);
    });
  }

  if (req.url?.startsWith("/robots/") && req.method === "DELETE") {
    if (!authOk(req)) return send(res, 401, { code: "UNAUTHORIZED" }, cors);
    const id = req.url.split("/")[2];
    const list = readRobots().filter((x) => x.id !== id);
    writeRobots(list);
    res.writeHead(204, cors);
    return res.end();
  }

  // -------- TESTS (dummy) --------
  if (req.url === "/tests/backtest/spot" && req.method === "POST") {
    if (!authOk(req)) return send(res, 401, { code: "UNAUTHORIZED" }, cors);
    return parseBody(req, res, ({ symbol, timeframe }) => {
      const result = {
        pnl: 1245.5,
        winrate: 0.62,
        maxDrawdown: 0.18,
        trades: [{ time: new Date().toISOString(), side: "buy", qty: 100, price: 42000, result: 50 }],
      };
      return send(res, 200, result, cors);
    });
  }

  // fallback
  res.writeHead(404, cors);
  res.end("not found");
});

server.listen(8080, () => console.log("api-gateway running on :8080"));
