// services/scanner/index.js
import http from "http";
import { readFileSync, existsSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.SCANNER_PORT || 8091;

function loadJSON(p, fallback) {
  try {
    if (!existsSync(p)) return fallback;
    const raw = readFileSync(p, "utf8") || "";
    return JSON.parse(raw || "null") ?? fallback;
  } catch { return fallback; }
}

const templates = loadJSON(`${__dirname}/templates.json`, []);
const dataset   = loadJSON(`${__dirname}/data.json`, []);

function cmp(item, rule) {
  const { field, op, value, valueField } = rule;
  const left = item[field];
  const right = (valueField ? item[valueField] : value);

  if (left === undefined || right === undefined) return false;

  switch (op) {
    case "gt":  return left >  right;
    case "gte": return left >= right;
    case "lt":  return left <  right;
    case "lte": return left <= right;
    case "eq":  return left === right;
    case "neq": return left !== right;
    default:    return false;
  }
}

function applyRules(items, rules) {
  if (!Array.isArray(rules) || rules.length === 0) return items;
  return items.filter(it => rules.every(r => cmp(it, r)));
}

const server = http.createServer((req, res) => {
  // CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    return res.end();
  }
  const cors = { "Access-Control-Allow-Origin": "*" };

  // health
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  // templates
  if (req.url === "/templates" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(templates.map(t => ({ key: t.key, name: t.name, market: t.market }))));
  }

  // search
  if (req.url === "/search" && req.method === "POST") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
      try {
        const { market = "spot", template, rules = [] } = JSON.parse(body || "{}");

        const base = dataset.filter(d => d.market === market);
        let finalRules = rules;

        if (template) {
          const tpl = templates.find(t => t.key === template);
          if (tpl) finalRules = tpl.rules || [];
        }

        const out = applyRules(base, finalRules).map(it => ({
          symbol: it.symbol,
          change24h: it.change24h,
          volume24h: it.volume24h,
          score: Number((Math.random() * 0.4 + 0.6).toFixed(2)) // dummy skor
        }));

        res.writeHead(200, { "Content-Type": "application/json", ...cors });
        return res.end(JSON.stringify(out));
      } catch {
        res.writeHead(400, cors);
        return res.end(JSON.stringify({ code: "BAD_REQUEST", message: "invalid JSON" }));
      }
    });
    return;
  }

  res.writeHead(404, cors);
  res.end("not found");
});

server.listen(PORT, () => console.log(`scanner service on :${PORT}`));
