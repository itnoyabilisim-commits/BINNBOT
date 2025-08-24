// services/scheduler/index.js
import http from "http";

const PORT = process.env.SCHEDULER_PORT || 8093;

// Dummy görev listesi (ileride DB’den okunacak)
let tasks = [
  { id: "1", type: "start", robotId: "r-abc", at: "2025-08-24T12:00:00Z" },
  { id: "2", type: "stop",  robotId: "r-def", at: "2025-08-24T14:00:00Z" }
];

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
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // healthz
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  // GET /tasks
  if (req.url === "/tasks" && req.method === "GET") {
    res.writeHead(200, cors(res));
    return res.end(JSON.stringify(tasks));
  }

  // POST /tasks → yeni görev ekle
  if (req.url === "/tasks" && req.method === "POST") {
    let body = "";
    req.on("data", (c)=> body += c);
    req.on("end", ()=>{
      try {
        const t = JSON.parse(body || "{}");
        if (!t.robotId || !t.type || !t.at) {
          res.writeHead(400, cors(res));
          return res.end(JSON.stringify({ code:"BAD_REQUEST", message:"robotId, type, at gerekli" }));
        }
        t.id = Date.now().toString();
        tasks.push(t);
        res.writeHead(201, cors(res));
        res.end(JSON.stringify(t));
      } catch {
        res.writeHead(400, cors(res));
        res.end(JSON.stringify({ code:"BAD_REQUEST", message:"invalid JSON" }));
      }
    });
    return;
  }

  // DELETE /tasks/{id}
  if (req.url.startsWith("/tasks/") && req.method === "DELETE") {
    const id = req.url.split("/")[2];
    tasks = tasks.filter(t => t.id !== id);
    res.writeHead(204, cors(res));
    return res.end();
  }

  res.writeHead(404, cors(res));
  res.end("not found");
});

server.listen(PORT, ()=> console.log(`scheduler service on :${PORT}`));
