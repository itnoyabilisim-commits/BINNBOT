// services/robot-exec/index.js
import { subscribeOrders } from "./events.js";

console.log("robot-exec service started");

// orders.v1 subscribe (dummy)
subscribeOrders((order) => {
  console.log("EXECUTOR received order:", order);
  // Normalde burada execution simülasyonu yapar ve reporting'e yazarız.
});

// heartbeat
setInterval(() => {
  console.log("robot-exec heartbeat", new Date().toISOString());
}, 10000);
