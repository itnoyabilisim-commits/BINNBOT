// services/robot-exec/index.js
import { subscribeOrders } from "./events.js";

console.log("robot-exec service started");

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
    pnl: (Math.random() * 200 - 100).toFixed(2), // -100 ile +100 arası
    ts: new Date().toISOString()
  };

  // normalde reporting'e HTTP POST yaparız
  console.log("EXECUTION:", exec);
});
