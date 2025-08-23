import http from "http";
import { randomUUID } from "crypto";

let robots = [];
let refreshTokens = [];

const server = http.createServer((req, res) => {
  // Basit JSON parse helper
  const parseBody = (cb) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        cb(JSON.parse(body || "{}"));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ code: "BAD_REQUEST", message: "invalid JSON" }));
      }
    });
  };

  // Routes
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200);
    return res.end("ok");
  }

  if (req.url === "/auth/login" && req.method === "POST") {
    return parseBody(({ email, password }) => {
      if (!email || !password) {
        res.writeHead(400);
        return res.end(JSON.stringify({ code: "BAD_REQUEST", message: "email/password required" }));
      }
      const accessToken = randomUUID();
      const refreshToken = randomUUID();
      refreshTokens.push(refreshToken);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ accessToken, refreshToken, expiresIn: 3600 }));
    });
  }

  if (req.url === "/auth/refresh" && req.method === "POST") {
    return parseBody(({ refreshToken }) => {
      if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        res.writeHead(401);
        return res.end(JSON.stringify({ code: "UNAUTHORIZED", message: "invalid refresh token" }));
      }
      const accessToken = randomUUID();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ accessToken, refreshToken, expiresIn: 3600 }));
    });
  }

  if (req.url === "/robots" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ items: robots }));
  }

  if (req.url === "/robots" && req.method === "POST") {
    return parseBody((body) => {
      const r = { id: randomUUID(), ...body, status: "active" };
      robots.push(r);
      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(r));
    });
  }

  if (req.url?.startsWith("/robots/") && req.method === "PATCH") {
    const id = req.url.split("/")[2];
    return parseBody((body) => {
      const idx = robots.findIndex((r) => r.id === id);
      if (idx === -1) {
        res.writeHead(404);
        return res.end(JSON.stringify({ code: "NOT_FOUND", message: "robot not found" }));
      }
      robots[idx] = { ...robots[idx], ...body };
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(robots[idx]));
    });
  }

  if (req.url?.startsWith("/robots/") && req.method === "DELETE") {
    const id = req.url.split("/")[2];
    robots = robots.filter((r) => r.id !== id);
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/tests/backtest/spot" && req.method === "POST") {
    return parseBody(({ symbol, timeframe }) => {
      const result = {
        pnl: 1245.5,
        winrate: 0.62,
        maxDrawdown: 0.18,
        trades: [
          { time: new Date().toISOString(), side: "buy", qty: 100, price: 42000, result: 50 },
        ],
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result));
    });
  }

  // fallback
  res.writeHead(404);
  res.end("not found");
});

server.listen(8080, () => console.log("api-gateway running on :8080"));
