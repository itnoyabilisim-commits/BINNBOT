// services/lib/binance.js
import crypto from "crypto";

const BASE = process.env.BINANCE_BASE_URL || "https://api.binance.com";
const API_KEY = process.env.BINANCE_API_KEY || "";
const API_SECRET = process.env.BINANCE_API_SECRET || "";
export const BINANCE_INFO = {
  BASE,
  SANDBOX: String(process.env.BINANCE_SANDBOX || "false").toLowerCase() === "true",
};

// --- utils ---
function qs(obj = {}) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

function extractRateMeta(headers) {
  // header isimleri endpoint ve cluster'a göre değişebilir
  const used =
    headers.get("x-mbx-used-weight-1m") ||
    headers.get("x-mbx-used-weight") ||
    null;
  const serverTime = headers.get("date") || null;
  return { usedWeight1m: used ? Number(used) : null, serverTime };
}

/**
 * Binance public REST
 * @returns { ok, status, json, meta:{rate} }
 */
export async function binanceRestPublic(path, params = {}) {
  const url = `${BASE}${path}${Object.keys(params).length ? `?${qs(params)}` : ""}`;
  const r = await fetch(url);
  const text = await r.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { ok: r.ok, status: r.status, json, meta: { rate: extractRateMeta(r.headers) } };
}

/**
 * Binance signed REST (HMAC SHA256)
 * @returns { ok, status, json, meta:{rate} }
 */
export async function binanceRestSigned(method, path, params = {}) {
  if (!API_KEY || !API_SECRET) {
    return {
      ok: false,
      status: 400,
      json: { code: "BINANCE_KEY_MISSING", msg: "BINANCE_API_KEY/SECRET yok" },
      meta: { rate: null }
    };
  }
  const timestamp = Date.now();
  const recvWindow = 10_000; // clock skew toleransı
  const query = qs({ ...params, timestamp, recvWindow });
  const signature = crypto.createHmac("sha256", API_SECRET).update(query).digest("hex");
  const url = `${BASE}${path}?${query}&signature=${signature}`;

  const r = await fetch(url, {
    method,
    headers: { "X-MBX-APIKEY": API_KEY, "Content-Type": "application/json" },
  });

  const text = await r.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { ok: r.ok, status: r.status, json, meta: { rate: extractRateMeta(r.headers) } };
}

/**
 * Binance hata haritalama – gateway'e tek formatta döndürmek için
 * @param {{status:number,json:any,meta?:any}} resp
 * @returns {{code:string,message:string,details?:any,status:number}}
 */
export function normalizeBinanceError(resp) {
  const status = resp?.status || 502;
  const j = resp?.json || {};
  // Binance rate-limit / ban
  if (status === 418 || status === 429) {
    return {
      code: "BINANCE_RATE_LIMIT",
      message: "Binance rate limit aşıldı. Lütfen daha sonra tekrar deneyin.",
      details: { binance: j, rate: resp?.meta?.rate || null },
      status,
    };
  }
  // Binance JSON hata formatı genelde { code: -xxxx, msg: "..." }
  if (typeof j?.code !== "undefined" && j?.msg) {
    const m = String(j.msg);
    return {
      code: "BINANCE_ERROR",
      message: m,
      details: { binanceCode: j.code, rate: resp?.meta?.rate || null },
      status,
    };
  }
  // Diğer upstream hataları
  return {
    code: "UPSTREAM_ERROR",
    message: "Binance ile iletişimde hata oluştu.",
    details: { raw: j, rate: resp?.meta?.rate || null },
    status,
  };
}
