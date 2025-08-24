// services/reporting/index.js
import http from "http";
import { init, insertReport, getLatest } from "./db.js";

const PORT = process.env.REPORTING_PORT || 8092;

// init çalıştır
init().catch(err => console.error("DB init error", err));

const server = http.createServer((req, res) => {
  const cors = { "Access-Control-Allow-Origin": "*" };

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  if (req.url === "/reports/summary" && req.method === "GET") {
    getLatest().then(rows => {
      res.writeHead(200, { "Content-Type": "application/json", ...cors });
      res.end(JSON.stringify(rows));
    }).catch(e => {
      res.writeHead(500, cors);
      res.end(JSON.stringify({ code:"DB_ERROR", message:String(e) }));
    });
    return;
  }

  if (req.url === "/reports/add" && req.method === "POST") {
    let body = "";
    req.on("data", (c)=> body += c);
    req.on("end", ()=>{
      try {
        const r = JSON.parse(body || "{}");
        insertReport(r).then(()=>{
          res.writeHead(201, cors);
          res.end("ok");
        }).catch(e=>{
          res.writeHead(500, cors);
          res.end(JSON.stringify({ code:"DB_ERROR", message:String(e) }));
        });
      } catch {
        res.writeHead(400, cors);
        res.end(JSON.stringify({ code:"BAD_REQUEST", message:"invalid JSON" }));
      }
    });
    return;
  }

  res.writeHead(404, cors);
  res.end("not found");
});

server.listen(PORT, ()=> console.log(`reporting service on :${PORT}`));
