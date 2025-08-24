// services/market-ingestor/index.js
import http from "http";
import { WebSocket } from "ws";
import { URL } from "url";

const PORT = process.env.MARKET_INGESTOR_PORT || 8091; // HTTP port
// Testnet varsayılanı; prod için: wss://stream.binance.com:9443/ws
const BINANCE_WS_BASE = process.env.BINANCE_WS_URL || "wss://testnet.binance.vision/ws";

// Son tick'leri bellekte tutalım (symbol -> { bid, ask, ts })
const lastTicks = new Map();

// Aktif WS bağlantıları (symbol -> ws)
const sockets = new Map();

// Basit symbol normalizasyonu
function norm(sym) {
  return (sym || "").trim().toUpperCase();
}

// Belirli bir symbol için WS aboneliği aç
function startStream(symbol) {
  const sym = norm(symbol);
  if (!sym) return { ok: false, message: "symbol gerekli" };
  if (sockets.has(sym)) return { ok: true, message: "zaten açık" };

  // bookTicker stream (en hafif ve yeterli)
  // testnet formatı: wss://testnet.binance.vision/ws/<symbol>@bookTicker
  const url = `${BINANCE_WS_BASE.replace(/\/$/,"")}/${sym.toLowerCase()}@bookTicker`;
  const ws = new WebSocket(url);

  ws.on("open", () => {
    console.log(`[ingestor] WS open: ${sym}`);
  });

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      // Binance bookTicker alanları: b(Best bid price) B(Best bid qty) a(Best ask price) A(Best ask qty)
      const tick = {
        symbol: sym,
        bid: Number(msg.b ?? 0),
        ask: Number(msg.a ?? 0),
        ts: msg.E || Date.now()
      };
      lastTicks.set(sym, tick);
    } catch (e) {
      console.error("[ingestor] parse error:", e);
    }
  });

  ws.on("close", () => {
    console.log(`[ingestor] WS close: ${sym}`);
    sockets.delete(sym);
  });

  ws.on("error", (err) => {
    console.error(`[ingestor] WS error: ${sym}`, err?.message || err);
  });

  sockets.set(sym, ws);
  return { ok: true, message: "başlatıldı" };
}

// Aboneliği kapat
function stopStream(symbol) {
  const sym = norm(symbol);
  const ws = sockets.get(sym);
  if (!ws) return { ok: true, message: "zaten kapalı" };
  try { ws.close(); } catch {}
  sockets.delete(sym);
  return { ok: true, message: "durduruldu" };
}

function send(res, status, data, headers = {}) {
  const h = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", ...headers };
  res.writeHead(status, h);
  res.end(typeof data === "string" ? data : JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // Sağlık
  if (req.url === "/healthz" && req.method === "GET") {
    return send(res, 200, "ok");
  }

  // Son fiyat: /ticks?symbol=BTCUSDT
  if (req.url.startsWith("/ticks") && req.method === "GET") {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const sym = norm(u.searchParams.get("symbol"));
    if (!sym) return send(res, 400, { code: "BAD_REQUEST", message: "symbol gerekli" });
    const tick = lastTicks.get(sym) || null;
    return send(res, 200, { symbol: sym, tick });
  }

  // Stream başlat: /stream/start?symbol=BTCUSDT
  if (req.url.startsWith("/stream/start") && req.method === "POST") {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const sym = norm(u.searchParams.get("symbol"));
    const out = startStream(sym);
    return send(res, out.ok ? 200 : 400, out);
  }

  // Stream durdur: /stream/stop?symbol=BTCUSDT
  if (req.url.startsWith("/stream/stop") && req.method === "DELETE") {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const sym = norm(u.searchParams.get("symbol"));
    const out = stopStream(sym);
    return send(res, out.ok ? 200 : 400, out);
  }

  // Mevcut abonelikler
  if (req.url === "/streams" && req.method === "GET") {
    return send(res, 200, { streams: Array.from(sockets.keys()) });
  }

  return send(res, 404, { code: "NOT_FOUND", message: "not found" });
});

server.listen(PORT, () => {
  console.log(`[ingestor] listening on :${PORT}`);
  // Örnek: BTC ve ETH’yi otomatik başlatmak istersen:
  // startStream("BTCUSDT"); startStream("ETHUSDT");
});
