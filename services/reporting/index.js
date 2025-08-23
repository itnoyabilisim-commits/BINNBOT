// services/reporting/index.js
import http from "http";
import { readFileSync, existsSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.REPORTING_PORT || 8092;

function readSummary() {
  const p = `${__dirname}/sample-data/summary.json`;
  if (!existsSync(p)) {
    return {
      pnlTotal: 0, winrate: 0, maxDrawdown: 0, pnlDaily: []
    };
  }
  try {
    const raw = readFileSync(p, "utf8") || "{}";
    return JSON.parse(raw);
  } catch {
    return { pnlTotal: 0, winrate: 0, maxDrawdown: 0, pnlDaily: [] };
  }
}

const server = http.createServer((req, res) => {
  // CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }
  const cors = { "Access-Control-Allow-Origin": "*" };

  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  if (req.url.startsWith("/summary") && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(readSummary()));
  }

  res.writeHead(404, cors);
  res.end("not found");
});

server.listen(PORT, () => console.log(`reporting service on :${PORT}`));
