// services/api-gateway/events.js
// Amaç: robot oluşturulunca "ORDER_REQUESTED" gibi bir event loglamak.
// RabbitMQ olmadığında sadece console.log yapacağız.

export async function publishOrderRequested(order) {
  // Normalde amqp publish olur. Şimdilik sadece log:
  console.log("[events] ORDER_REQUESTED", order);
}
