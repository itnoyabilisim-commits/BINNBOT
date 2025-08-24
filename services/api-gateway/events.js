// services/api-gateway/events.js
export async function publishOrderRequested(order) {
  // Şimdilik sadece log
  console.log("[events] ORDER_REQUESTED", order);
}

export async function sendExecutionToReporting(exec) {
  try {
    const url = process.env.REPORTING_URL || "http://localhost:8092";
    const r = await fetch(`${url}/execs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exec)
    });
    const txt = await r.text();
    console.log("[events] EXECUTION -> reporting:", r.status, txt);
  } catch (e) {
    console.error("[events] EXECUTION send error", e);
  }
}
