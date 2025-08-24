// services/robot-exec/events.js
// Amaç: orders.v1 kanalına "subscribe" eden dummy stub.
// RabbitMQ yoksa çalıştırmaz; sadece fonksiyonlar repo'da dursun.

export async function subscribeOrders(onMessage) {
  // Normalde burada amqp.connect(...) ve channel.consume(...) olur.
  // Şimdilik sadece 5 saniyede bir dummy mesaj tetikleyelim:
  setInterval(() => {
    const msg = {
      robotId: "dummy-robot",
      symbol: "BTCUSDT",
      side: "buy",
      qty: 100,
      price: 42000,
      ts: new Date().toISOString()
    };
    onMessage(msg);
  }, 5000);
}
