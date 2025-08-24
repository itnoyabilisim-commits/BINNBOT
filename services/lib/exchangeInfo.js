// services/lib/exchangeInfo.js
// Binance exchangeInfo için basit bellek cache

import { binanceRestPublic } from "./binance.js";

let cache = {
  fetchedAt: 0,
  symbols: {}, // "BTCUSDT": { lotSize: {minQty, maxQty, stepSize}, minNotional: {minNotional} }
};

const TTL_MS = 5 * 60 * 1000; // 5 dk

function parseFilters(arr = []) {
  const out = {};
  for (const f of arr) {
    if (!f || !f.filterType) continue;
    out[f.filterType] = f;
  }
  return out;
}

export async function ensureExchangeInfo(force = false) {
  const now = Date.now();
  if (!force && now - cache.fetchedAt < TTL_MS && Object.keys(cache.symbols).length > 0) {
    return { ok: true, fromCache: true };
  }
  const r = await binanceRestPublic("/api/v3/exchangeInfo");
  if (!r.ok) return { ok: false, status: r.status, json: r.json };

  const map = {};
  for (const s of r.json.symbols || []) {
    const f = parseFilters(s.filters);
    const lot = f.LOT_SIZE || {};
    const minNo = f.MIN_NOTIONAL || {};
    map[s.symbol] = {
      lotSize: {
        minQty: Number(lot.minQty || "0"),
        maxQty: Number(lot.maxQty || "0"),
        stepSize: Number(lot.stepSize || "0"),
      },
      minNotional: {
        minNotional: Number(minNo.minNotional || "0"),
      },
    };
  }

  cache.symbols = map;
  cache.fetchedAt = now;
  return { ok: true, fromCache: false };
}

export function getSymbolFilters(symbol) {
  return cache.symbols[String(symbol || "").toUpperCase()] || null;
}
