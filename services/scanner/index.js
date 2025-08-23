// services/scanner/index.js
import http from "http";
import { readFileSync, existsSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.SCANNER_PORT || 8091;

function readTemplates() {
  const p = `${__dirname}/templates.json`;
  if (!existsSync(p)) return [];
  try {
    return JSON.parse(readFileSync(p, "utf8") || "[]");
  } catch { return []; }
}

function dummySearch() {
  return [
    { symbol: "BTCUSDT", change24h: 0.034, volume24h: 250000000, score: 0.82 },
    { symbol: "ETHUSDT", change24h: 0.028, volume24h: 180000000, score: 0.74 }
  ];
}

const server = http.createServer((req, res) => {
  // CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }
  const cors = { "Access-Control-Allow-Origin": "*" };

  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  if (req.url === "/templates" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(readTemplates()));
  }

  if (req.url === "/search" && req.method === "POST") {
    // normalde body parse edip gerçek filtre uygularız; şimdilik dummy dönüyoruz
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(dummySearch()));
  }

  res.writeHead(404, cors);
  res.end("not found");
});

server.listen(PORT, () => console.log(`scanner service on :${PORT}`));
