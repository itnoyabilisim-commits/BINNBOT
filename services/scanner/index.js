// services/scanner/index.js
console.log("scanner service started");

// Dummy hazır template listesi
const templates = [
  { key: "trend-strong", name: "Güçlü Trend Coinler", market: "spot" },
  { key: "rsi-oversold", name: "RSI Düşük (Alım Fırsatı)", market: "spot" },
];

// Dummy search fonksiyonu
function search(filters) {
  return [
    { symbol: "BTCUSDT", change24h: 0.034, volume24h: 250000000, score: 0.82 },
    { symbol: "ETHUSDT", change24h: 0.028, volume24h: 180000000, score: 0.74 },
  ];
}

// Her 15 saniyede bir log
setInterval(() => {
  console.log("scanner heartbeat", new Date().toISOString());
}, 15000);
