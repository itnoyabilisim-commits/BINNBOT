// services/api-gateway/testables.mjs
// Not: Bunlar index.js içindeki mantığın birebir kopyasıdır (test için dışa alındı)

export function roundToStep(x, step) {
  if (!step || step <= 0) return x;
  const p = Math.round(Math.log10(1 / step));
  return Number((Math.floor(x / step) * step).toFixed(Math.max(p, 0)));
}

/**
 * @param {string} symbol
 * @param {"MARKET"|"LIMIT"} type
 * @param {number} quantity
 * @param {number} price
 * @param {{ lotSize?: { minQty?: number, stepSize?: number }, minNotional?: { minNotional?: number } }} filters
 */
export function validateOrderQtyPriceAgainstFilters(symbol, type, quantity, price, filters = {}) {
  const f = filters || {};
  const lot = f.lotSize || {};
  const minQty = Number(lot.minQty || 0);
  const stepSize = Number(lot.stepSize || 0);

  if (quantity != null) {
    const q = Number(quantity);
    if (Number.isNaN(q) || q <= 0) return { ok: false, message: "quantity geçersiz" };
    if (minQty && q < minQty) return { ok: false, message: `quantity minQty (${minQty}) altı` };
    if (stepSize && ((q / stepSize) % 1 > 1e-8)) {
      const fixed = roundToStep(q, stepSize);
      return { ok: false, message: `quantity stepSize (${stepSize}) uyumsuz. Örn: ${fixed}` };
    }
  }

  if (type === "LIMIT") {
    const p = Number(price);
    if (Number.isNaN(p) || p <= 0) return { ok: false, message: "price geçersiz" };
    const mn = Number((f.minNotional || {}).minNotional || 0);
    if (mn && quantity != null) {
      if (Number(price) * Number(quantity) < mn) {
        return { ok: false, message: `price*quantity minNotional (${mn}) altı` };
      }
    }
  }
  return { ok: true };
}
