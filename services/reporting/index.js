// services/reporting/index.js
console.log("reporting service started");

// Dummy summary generator
function summary() {
  return {
    pnlTotal: 42031,
    winrate: 0.61,
    maxDrawdown: 0.22,
    pnlDaily: [
      { date: "2025-08-01", pnl: 1200 },
      { date: "2025-08-02", pnl: -340 },
    ],
  };
}

// Her 20 saniyede bir log
setInterval(() => {
  console.log("reporting heartbeat", new Date().toISOString());
}, 20000);
