// services/lib/binance.js
import crypto from "crypto";

const BASE = process.env.BINANCE_BASE_URL || "https://api.binance.com";
const API_KEY = process.env.BINANCE_API_KEY || "";
const API_SECRET = process.env.BINANCE_API_SECRET || "";
const SANDBOX = String(process.env.BINANCE_SANDBOX || "false").toLowerCase() === "true";

function qs(obj = {}) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export async function binanceRestPublic(path, params = {}) {
  const url = `${BASE}${path}${Object.keys(params).length ? `?${qs(params)}` : ""}`;
  const r = await fetch(url);
  const txt = await r.text();
  try { return { ok: r.ok, status: r.status, json: txt ? JSON.parse(txt) : null }; }
  catch { return { ok: r.ok, status: r.status, json: { raw: txt } }; }
}

export async function binanceRestSigned(method, path, params = {}) {
  if (!API_KEY || !API_SECRET) {
    return { ok: false, status: 400, json: { code: "BINANCE_KEY_MISSING", message: "BINANCE_API_KEY/SECRET yok" } };
  }
  const timestamp = Date.now();
  const recvWindow = 10_000;
  const query = qs({ ...params, timestamp, recvWindow });
  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(query)
    .digest("hex");

  const url = `${BASE}${path}?${query}&signature=${signature}`;
  const r = await fetch(url, {
    method,
    headers: { "X-MBX-APIKEY": API_KEY, "Content-Type": "application/json" }
  });
  const txt = await r.text();
  let json = null;
  try { json = txt ? JSON.parse(txt) : null; } catch { json = { raw: txt }; }
  return { ok: r.ok, status: r.status, json };
}

// Yardımcı: gerçek order endpointi SANDBOX değilse dikkat
export const BINANCE_INFO = { BASE, SANDBOX };
