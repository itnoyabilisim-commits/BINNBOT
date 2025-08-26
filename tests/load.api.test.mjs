// tests/load.api.test.mjs
// Basit yük testi: login → N robot oluştur → eşzamanlı "run" → raporları çek → temizle
import assert from "assert";

const BASE = process.env.GW_BASE || "http://localhost:8080";
const EMAIL = process.env.LOAD_EMAIL || "superadmin@binnbot.com";
const PASS  = process.env.LOAD_PASS  || "123456";

const ROBOTS      = Number(process.env.LOAD_ROBOTS || 20);      // toplam robot
const CONCURRENCY = Number(process.env.LOAD_CONC || 5);         // eşzamanlı istek
const SYMBOL      = process.env.LOAD_SYMBOL || "BTCUSDT";

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

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

// basit havuz
async function pool(items, size, worker) {
  const it = items.slice();
  const running = [];
  const results = [];
  for (let i=0; i<size && it.length; i++) {
    const p = worker(it.shift()).then(res => { results.push(res); });
    running.push(p);
  }
  while (it.length) {
    await Promise.race(running);
    // boşalanı çıkar, yenisini ekle
    for (let i=running.length-1; i>=0; i--) {
      if (running[i].resolved) { running.splice(i,1); }
    }
    const p = worker(it.shift()).then(res => { results.push(res); });
    // resolved flag için küçük wrapper
    p.then(()=>p.resolved=true).catch(()=>p.resolved=true);
    running.push(p);
  }
  await Promise.all(running);
  return results;
}

(async () => {
  console.log(`== LOAD START == ${new Date().toISOString()}`);
  console.log(`BASE=${BASE} ROBOTS=${ROBOTS} CONCURRENCY=${CONCURRENCY} SYMBOL=${SYMBOL}`);

  // 1) login
  let res = await j("POST", "/auth/login", { email: EMAIL, password: PASS });
  assert.equal(res.status, 200, "login failed");
  const access = res.json.accessToken;
  assert.ok(access, "no access token");

  // 2) N robot oluştur
  console.log(`Creating ${ROBOTS} robots...`);
  const robots = [];
  for (let i=0; i<ROBOTS; i++) {
    const side = i % 2 === 0 ? "buy" : "sell";
    const body = { symbol: SYMBOL, side, market: "spot", name: `LoadBot-${i+1}` };
    const r = await j("POST", "/robots", body, access);
    if (r.ok) robots.push(r.json);
    else throw new Error(`robot create failed: ${r.status} ${JSON.stringify(r.json)}`);
  }
  console.log(`Created: ${robots.length}`);

  // 3) Eşzamanlı run
  console.log(`Running ${robots.length} robots with concurrency=${CONCURRENCY} ...`);
  const ids = robots.map(r => r.id);
  const runResults = await pool(ids, CONCURRENCY, async (id) => {
    const rr = await j("POST", `/robots/${id}/run`, { qty: 0.1, price: 42000 }, access);
    return { id, ok: rr.ok, status: rr.status };
  });
  const okCount = runResults.filter(r => r.ok).length;
  console.log(`Run OK: ${okCount}/${runResults.length}`);

  // 4) Raporları çek
  await sleep(1000); // kısa bekleme
  const summary = await j("GET", "/reports/summary", null, access);
  const execs   = await j("GET", "/reports/execs?limit=50", null, access);
  console.log("Summary status:", summary.status, "Execs status:", execs.status);

  // 5) Temizlik (robotları sil)
  console.log("Cleaning robots...");
  const del = await pool(ids, CONCURRENCY, async (id) => {
    const d = await j("DELETE", `/robots/${id}`, null, access);
    return d.ok;
  });
  console.log(`Deleted: ${del.filter(Boolean).length}/${del.length}`);

  console.log("== LOAD OK ==");
  process.exit(0);
})().catch(e => {
  console.error("LOAD ERROR:", e);
  process.exit(1);
});
