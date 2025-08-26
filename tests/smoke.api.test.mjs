// tests/smoke.api.test.mjs
import assert from "assert";

const BASE = process.env.GW_BASE || "http://localhost:8080";
const EMAIL = process.env.SMOKE_EMAIL || "superadmin@binnbot.com";
const PASS  = process.env.SMOKE_PASS  || "123456";

// small helpers
async function j(method, path, body, token) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const txt = await r.text();
  let json = null; try { json = txt ? JSON.parse(txt) : null; } catch { json = { raw: txt }; }
  return { ok: r.ok, status: r.status, json };
}

(async () => {
  console.log("== SMOKE START ==");

  // 1) health + version
  let r = await fetch(`${BASE}/healthz`);            assert.equal(r.status, 200);
  r = await fetch(`${BASE}/version`);                assert.ok(r.status === 200 || r.status === 404);

  // 2) login
  let res = await j("POST", "/auth/login", { email: EMAIL, password: PASS });
  assert.equal(res.status, 200, "login failed");
  const access = res.json.accessToken;
  assert.ok(access, "no access token");

  // 3) robots → create
  res = await j("POST", "/robots", { symbol: "BTCUSDT", side: "buy", market: "spot" }, access);
  assert.equal(res.status, 201, "robot create failed");
  const robotId = res.json.id;
  assert.ok(robotId, "no robot id");

  // 4) robot run
  res = await j("POST", `/robots/${robotId}/run`, { qty: 0.1, price: 42000 }, access);
  assert.equal(res.status, 200, "robot run failed");
  assert.ok(res.json.exec, "no exec in run result");

  // 5) reports
  res = await j("GET", "/reports/summary", null, access);
  assert.equal(res.status, 200, "summary failed");

  res = await j("GET", "/reports/execs?limit=10", null, access);
  assert.equal(res.status, 200, "execs failed");

  console.log("== SMOKE OK ==");
  process.exit(0);
})().catch(e => {
  console.error("SMOKE ERROR:", e);
  process.exit(1);
});
