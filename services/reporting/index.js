// services/reporting/index.js
import http from "http";

let executions = [];

const server = http.createServer((req, res) => {
  if (req.url === "/summary" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      pnlTotal: 42031,
      winrate: 0.61,
      maxDrawdown: 0.22,
      pnlDaily: [{ date: "2025-08-01", pnl: 1200 }, { date: "2025-08-02", pnl: -340 }]
    }));
  }

  if (req.url === "/execs" && req.method === "POST") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        executions.push(data);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch {
        res.writeHead(400); res.end("invalid json");
      }
    });
    return;
  }

  if (req.url === "/execs" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(executions));
  }

  res.writeHead(404); res.end("not found");
});

server.listen(8092, () => console.log("reporting service on :8092"));
