import http from "http";
import { randomUUID } from "crypto";
import { readRobots, writeRobots } from "./storage.js";
import { login, verify } from "./auth.js";
import { publishOrderRequested } from "./events.js";   // 🔹 ekledik

const SCANNER_URL   = process.env.SCANNER_URL   || "";
const REPORTING_URL = process.env.REPORTING_URL || "";

// ... (send, parseBody, safeFetch, preflight aynı)

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

      // 🔹 event publish
      publishOrderRequested({ robotId: r.id, symbol: r.symbol, side: r.side });

      return send(res, 201, r);
    });
  }

  // ... (PATCH, DELETE, TESTS, SCANNER, REPORTS aynı kalıyor)

  send(res, 404, "not found");
});

server.listen(8080, () => console.log("api-gateway running on :8080"));
