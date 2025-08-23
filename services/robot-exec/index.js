// services/robot-exec/index.js
console.log("robot-exec service started");

// Dummy order consumer
// (Gerçekte RabbitMQ'dan "orders.v1" subscribe edecek)
setInterval(() => {
  console.log("robot-exec heartbeat", new Date().toISOString());
}, 10000);
