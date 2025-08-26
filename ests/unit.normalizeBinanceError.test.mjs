// tests/unit.normalizeBinanceError.test.mjs
import assert from "assert";
import { normalizeBinanceError } from "../services/lib/binance.js";

function fakeResp(status, json, meta) {
  return { status, json, meta };
}

(async () => {
  // rate-limit
  let m = normalizeBinanceError(fakeResp(429, { code: -1003, msg: "Too many requests" }, { rate: { usedWeight1m: 1200 } }));
  assert.equal(m.code, "BINANCE_RATE_LIMIT");

  // binance error code + msg
  m = normalizeBinanceError(fakeResp(400, { code: -2010, msg: "Account has insufficient balance" }, { rate: {} }));
  assert.equal(m.code, "BINANCE_ERROR");
  assert.ok(m.message.includes("insufficient balance"));

  // upstream generic
  m = normalizeBinanceError(fakeResp(500, { raw: "oops" }, {}));
  assert.equal(m.code, "UPSTREAM_ERROR");

  console.log("normalizeBinanceError OK");
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
