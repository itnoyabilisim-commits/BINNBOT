// services/notifier/index.js
import http from "http";

const PORT = process.env.NOTIFIER_PORT || 8094;

function cors(res) {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // healthz
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  // POST /notify
  if (req.url === "/notify" && req.method === "POST") {
    let body = "";
    req.on("data", (c)=> body += c);
    req.on("end", ()=>{
      try {
        const payload = JSON.parse(body || "{}");
        console.log("Notifier payload:", payload);

        // dummy response
        res.writeHead(200, cors(res));
        res.end(JSON.stringify({ ok: true, method: payload.type || "email" }));
      } catch {
        res.writeHead(400, cors(res));
        res.end(JSON.stringify({ code:"BAD_REQUEST", message:"invalid JSON" }));
      }
    });
    return;
  }

  res.writeHead(404, cors(res));
  res.end("not found");
});

server.listen(PORT, ()=> console.log(`notifier service on :${PORT}`));
