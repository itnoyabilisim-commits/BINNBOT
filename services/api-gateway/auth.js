// services/api-gateway/auth.js
import { createHmac, randomUUID } from "crypto";

const SECRET = process.env.JWT_SECRET || "supersecret123"; // .env yoksa dummy

// base64url yardımcıları
function b64url(input) {
  return Buffer.from(input).toString("base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlJSON(obj) { return b64url(JSON.stringify(obj)); }
function fromB64url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString();
}

// HS256 imzalı JWT üret
export function issueToken(sub, ttlSec = 3600, kind = "access") {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { sub, iat: now, exp: now + ttlSec, jti: randomUUID(), t: kind };
  const h = b64urlJSON(header);
  const p = b64urlJSON(payload);
  const sig = createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${h}.${p}.${sig}`;
}

// JWT doğrula (kind: "access" | "refresh")
export function verifyToken(token, kindExpected = "access") {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const sig = createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64")
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    if (sig !== s) return null;
    const payload = JSON.parse(fromB64url(p));
    if (payload.t !== kindExpected) return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload; // { sub, iat, exp, jti, t }
  } catch {
    return null;
  }
}
