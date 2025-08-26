// tests/unit.exchange.validate.test.mjs
import assert from "assert";
import { roundToStep, validateOrderQtyPriceAgainstFilters } from "../services/api-gateway/testables.mjs";

(async () => {
  // round
  assert.equal(roundToStep(1.23456, 0.01), 1.23);
  assert.equal(roundToStep(1.239, 0.001), 1.239);
  assert.equal(roundToStep(5, 0), 5);

  const filters = {
    lotSize: { minQty: 0.01, stepSize: 0.01 },
    minNotional: { minNotional: 10 }
  };

  // quantity < minQty
  let r = validateOrderQtyPriceAgainstFilters("BTCUSDT", "MARKET", 0.005, null, filters);
  assert.equal(r.ok, false);

  // quantity step uyumsuz
  r = validateOrderQtyPriceAgainstFilters("BTCUSDT", "MARKET", 0.0155, null, filters);
  assert.equal(r.ok, false);

  // LIMIT price*qty < minNotional
  r = validateOrderQtyPriceAgainstFilters("BTCUSDT", "LIMIT", 0.02, 100, filters); // 2 < 10
  assert.equal(r.ok, false);

  // Geçerli MARKET
  r = validateOrderQtyPriceAgainstFilters("BTCUSDT", "MARKET", 0.05, null, filters);
  assert.equal(r.ok, true);

  // Geçerli LIMIT
  r = validateOrderQtyPriceAgainstFilters("BTCUSDT", "LIMIT", 0.1, 120, filters);
  assert.equal(r.ok, true);

  console.log("exchange validate OK");
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
