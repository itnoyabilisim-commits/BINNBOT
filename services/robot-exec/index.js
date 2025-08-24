// services/robot-exec/index.js
import { subscribeOrders } from "./events.js";

const REPORTING_URL = process.env.REPORTING_URL || "http://localhost:8092";

console.log("robot-exec service started");

// Basit HTTP POST helper
async function postJSON(url, body) {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const txt = await r.text();
    console.log("[robot-exec] POST", url, r.status, txt);
  } catch (e) {
    console.error("[robot-exec] POST error:", e);
  }
}

// orders.v1 subscribe
subscribeOrders((order) => {
  console.log("EXECUTOR received order:", order);

  // Basit execution simülasyonu (PnL rastgele)
  const exec = {
    ...order,
    execId: "exec-" + Date.now(),
    filledQty: order.qty,
    avgPrice: order.price,
    result: Math.random() > 0.5 ? "win" : "loss",
    pnl: (Math.random() * 200 - 100).toFixed(2),
    ts: new Date().toISOString()
  };

  // Reporting'e gönder
  postJSON(`${REPORTING_URL}/execs`, exec);
});

// heartbeat
setInterval(() => {
  console.log("robot-exec heartbeat", new Date().toISOString());
}, 10000);
