// services/api-gateway/index.js
import http from "http";
import { randomUUID } from "crypto";
import { WebSocketServer } from "ws";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { readRobots, writeRobots } from "./storage.js";
import {
  login, verify, issueToken, verifyToken, requireRole,
  setRole, getAllRoles
} from "./auth.js";
import {
  binanceRestPublic, binanceRestSigned, BINANCE_INFO, normalizeBinanceError
} from "../lib/binance.js";
import { ensureExchangeInfo, getSymbolFilters } from "../lib/exchangeInfo.js";

// ==== ENV ====
const SCANNER_URL     = process.env.SCANNER_URL     || "";
const REPORTING_URL   = process.env.REPORTING_URL   || "";
const INGESTOR_URL    = process.env.INGESTOR_URL    || "http://localhost:8091";
const NOTIFIER_URL    = process.env.NOTIFIER_URL    || "";
const ROBOT_EXEC_URL  = process.env.ROBOT_EXEC_URL  || "http://localhost:8095";
const DASHBOARD_SYMBOLS = (process.env.DASHBOARD_SYMBOLS || "BTCUSDT,ETHUSDT")
  .split(",").map(s=>s.trim().toUpperCase()).filter(Boolean);

// ==== BUILD / LOG / METRICS (M4 eklendi) ====
const VERSION       = process.env.VERSION     || "0.0.0";
const BUILD_TIME    = process.env.BUILD_TIME  || "";
const GIT_SHA       = process.env.GIT_SHA     || "";
const LOG_REQUESTS  = String(process.env.LOG_REQUESTS || "false").toLowerCase() === "true";

const START_TIME = Date.now();
let   REQ_COUNT  = 0;
function incReq() { REQ_COUNT++; }
function nowIso() { return new Date().toISOString(); }
const LOG_PATH = process.env.LOG_PATH || "/var/log/binnbot/gateway.jsonl";
function logJsonl(obj) {
  try {
    const line = JSON.stringify({ ts: nowIso(), ...obj }) + "\n";
    // best-effort append
    try { writeFileSync(LOG_PATH, line, { flag: "a" }); } catch {}
  } catch {}
}

// ==== RATE LIMIT (dakikada N) ====
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 60);
const WINDOW_MS  = 60_000;
const rlMap = new Map(); // ip -> {count,start}
function rateLimit(req,res){
  const ip=(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"")+""; 
  const now=Date.now();
  const e=rlMap.get(ip)||{count:0,start:now};
  if(now-e.start>WINDOW_MS){e.count=0;e.start=now;}
  e.count++; rlMap.set(ip,e);
  if(e.count>RATE_LIMIT){
    res.writeHead(429,{"Content-Type":"application/json","Retry-After":"60","Access-Control-Allow-Origin":"*"});
    res.end(JSON.stringify({code:"RATE_LIMIT",message:"Too many requests, please retry later."}));
    return false;
  } return true;
}

// ==== helpers ====
function send(res,code,data,hdrs={}){const h={"Content-Type":"application/json","Access-Control-Allow-Origin":"*",...hdrs};res.writeHead(code,h);res.end(typeof data==="string"?data:JSON.stringify(data));}
function error(res, code, message, status=400, hdrs={}){return send(res,status,{code,message},hdrs);}
function parseBody(req,res,cb){let b="";req.on("data",c=>b+=c);req.on("end",()=>{try{cb(JSON.parse(b||"{}"))}catch{return error(res,"BAD_REQUEST","invalid JSON",400)}});}
async function safeFetch(url, init){try{const r=await fetch(url,init);const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch{j={raw:t}};return {ok:r.ok,status:r.status,json:j}}catch(e){return {ok:false,status:502,json:{code:"UPSTREAM_ERROR",message:String(e)}}}}
function preflight(req,res){if(req.method==="OPTIONS"){res.writeHead(204,{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization"});res.end();return true}return false}

// notifier helper
async function notifyAdmins(payload){
  if(!NOTIFIER_URL) return;
  try{
    await safeFetch(`${NOTIFIER_URL}/notify`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
  }catch{}
}

// ==== audit (append-only file) ====
const AUDIT_FILE = "services/api-gateway/tmp/audit.log";
try { mkdirSync("services/api-gateway/tmp",{recursive:true}); } catch {}
function auditLog(event, payload, actor){
  const rec={ts:new Date().toISOString(),event,actor:actor?.sub||null,role:actor?.role||null,payload};
  try{
    const prev=existsSync(AUDIT_FILE)?readFileSync(AUDIT_FILE,"utf8")+"":"";
    writeFileSync(AUDIT_FILE, prev+JSON.stringify(rec)+"\n","utf8");
  }catch{}
}
function auditRead(limit=200){
  try{
    const txt=existsSync(AUDIT_FILE)?readFileSync(AUDIT_FILE,"utf8"):"";
    const lines=txt.trim()?txt.trim().split("\n"):[];
    return lines.slice(-limit).map(x=>{try{return JSON.parse(x)}catch{return {raw:x}}});
  }catch{return []}
}

// ==== emergency stop memory ====
const approvals=new Map(); // key -> { req:{scope,mode,reason,includeOpenOrders,symbols[]}, approvals:Set, executed:boolean, code:string }

// ==== exchangeInfo validation ====
function roundToStep(x, step){ if(!step||step<=0) return x; const p=Math.round(Math.log10(1/step)); return Number((Math.floor(x/step)*step).toFixed(Math.max(p,0))); }
function validateOrderQtyPrice(symbol, type, quantity, price){
  const f=getSymbolFilters(symbol); if(!f) return {ok:false,message:"exchangeInfo yok/yenileyin"};
  const {minQty,stepSize}=f.lotSize||{};
  if(quantity!=null){const q=Number(quantity); if(isNaN(q)||q<=0) return {ok:false,message:"quantity geçersiz"};
    if(minQty && q<minQty) return {ok:false,message:`quantity minQty (${minQty}) altı`};
    if(stepSize && ((q/stepSize)%1>1e-8)){const fixed=roundToStep(q,stepSize); return {ok:false,message:`quantity stepSize (${stepSize}) uyumsuz. Örn: ${fixed}`};}}
  if(type==="LIMIT"){const p=Number(price); if(isNaN(p)||p<=0) return {ok:false,message:"price geçersiz"};
    const mn=f.minNotional?.minNotional||0; if(mn && quantity!=null){ if(Number(price)*Number(quantity)<mn) return {ok:false,message:`price*quantity minNotional (${mn}) altı`};}}
  return {ok:true};
}

// ==== HTTP server ====
const server=http.createServer(async (req,res)=>{
  // metrics + istek log (M4 eklendi)
  if (LOG_REQUESTS) {
    console.log(`[REQ] ${nowIso()} ${req.method} ${req.url}`);
    logJsonl({ type: "req", method: req.method, url: req.url });
  }

  if(preflight(req,res)) return;
  if(!rateLimit(req,res)) return;
  incReq();

  // ---------- M4: system/health endpoints ----------
  // smoke: basit duman testi
  if (req.url === "/__smoke" && req.method === "GET") {
    return send(res, 200, { ok: true, ts: nowIso() });
  }

  // version: build bilgisi
  if (req.url === "/version" && req.method === "GET") {
    return send(res, 200, {
      version: VERSION,
      buildTime: BUILD_TIME,
      gitSha: GIT_SHA,
      startedAt: new Date(START_TIME).toISOString()
    });
  }

  // metrics: uptime, reqCount, memory
  if (req.url === "/metrics" && req.method === "GET") {
    const mem = process.memoryUsage();
    return send(res, 200, {
      uptimeSec: Math.floor((Date.now() - START_TIME) / 1000),
      reqCount: REQ_COUNT,
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external
      },
      ts: nowIso()
    });
  }
    // metrics (prometheus-like)
  if (req.url === "/metrics.txt" && req.method === "GET") {
    const mem = process.memoryUsage();
    const lines = [
      `binnbot_uptime_seconds ${Math.floor((Date.now() - START_TIME) / 1000)}`,
      `binnbot_requests_total ${REQ_COUNT}`,
      `binnbot_memory_rss_bytes ${mem.rss}`,
      `binnbot_memory_heap_total_bytes ${mem.heapTotal}`,
      `binnbot_memory_heap_used_bytes ${mem.heapUsed}`,
      `binnbot_memory_external_bytes ${mem.external}`
    ];
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end(lines.join("\n") + "\n");
  }

  // readyz: upstream health (varsa)
  if (req.url === "/readyz" && req.method === "GET") {
    const targets = [
      { key: "reporting", url: REPORTING_URL ? `${REPORTING_URL}/healthz` : "" },
      { key: "scanner",   url: SCANNER_URL   ? `${SCANNER_URL}/healthz`   : "" },
      { key: "ingestor",  url: INGESTOR_URL  ? `${INGESTOR_URL}/healthz`  : "" },
      { key: "notifier",  url: NOTIFIER_URL  ? `${NOTIFIER_URL}/healthz`  : "" },
      { key: "robotExec", url: ROBOT_EXEC_URL? `${ROBOT_EXEC_URL}/healthz`: "" },
    ].filter(x => x.url);

    const results = {};
    for (const t of targets) {
      try {
        const r = await fetch(t.url, { method: "GET" });
        results[t.key] = r.ok ? "ok" : `bad(${r.status})`;
      } catch (e) {
        results[t.key] = `error(${String(e)})`;
      }
    }
    return send(res, 200, { ok: true, results, ts: nowIso() });
  }
  // -------------------------------------------------

  // system
  if(req.url==="/healthz" && req.method==="GET"){res.writeHead(200);return res.end("ok");}

  // auth
  if(req.url==="/auth/login" && req.method==="POST"){
    return parseBody(req,res,({email,password})=>{
      try{ return send(res,200,login(email,password)); }
      catch(e){ return error(res,"BAD_REQUEST",e.message||"login failed",400); }
    });
  }
  if(req.url==="/auth/refresh" && req.method==="POST"){
    return parseBody(req,res,({refreshToken})=>{
      const pay=refreshToken?verifyToken(refreshToken,"refresh"):null;
      if(!pay) return error(res,"UNAUTHORIZED","invalid refresh",401);
      const accessToken=issueToken(pay.sub,3600,"access",pay.role);
      return send(res,200,{accessToken,refreshToken,expiresIn:3600});
    });
  }

  // ===== ADMIN ROLES =====
  if(req.url==="/admin/roles" && req.method==="GET"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin"])) return error(res,"FORBIDDEN","role required",403);
    return send(res,200,{roles:getAllRoles()});
  }
  if(req.url==="/admin/roles" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin"])) return error(res,"FORBIDDEN","SuperAdmin required",403);
    return parseBody(req,res,({email,role})=>{
      if(!email||!role) return error(res,"BAD_REQUEST","email ve role gerekli",400);
      const roles=setRole(String(email).toLowerCase(),role);
      auditLog("roles.update",{email,role},user);
      return send(res,200,{ok:true,roles});
    });
  }

  // ===== BINANCE (public/signed) =====
  if(req.url==="/exchange/binance/ping" && req.method==="GET"){
    (async()=>{const r=await binanceRestPublic("/api/v3/ping"); if(!r.ok){const m=normalizeBinanceError(r);return error(res,m.code,m.message,m.status);} return send(res,r.status,{ping:"pong",base:BINANCE_INFO.BASE,sandbox:BINANCE_INFO.SANDBOX});})(); return;
  }
  if(req.url==="/exchange/binance/time" && req.method==="GET"){
    (async()=>{const r=await binanceRestPublic("/api/v3/time"); if(!r.ok){const m=normalizeBinanceError(r);return error(res,m.code,m.message,m.status);} return send(res,r.status,{...r.json,base:BINANCE_INFO.BASE,sandbox:BINANCE_INFO.SANDBOX});})(); return;
  }
  // exchangeInfo refresh
  if(req.url==="/exchange/binance/exchangeInfo/refresh" && req.method==="POST"){
    (async()=>{const r=await ensureExchangeInfo(true); if(!r.ok) return error(res,"UPSTREAM_ERROR","exchangeInfo alınamadı",r.status||502); return send(res,200,{ok:true,fromCache:r.fromCache===true});})(); return;
  }
  // account (SIGNED)
  if(req.url==="/exchange/binance/account" && req.method==="GET"){
    (async()=>{const r=await binanceRestSigned("GET","/api/v3/account"); if(!r.ok){const m=normalizeBinanceError(r);return error(res,m.code,m.message,m.status);} return send(res,r.status,r.json);})(); return;
  }
  // exchangeInfo pass-through
  if(req.url.startsWith("/exchange/binance/exchangeInfo") && req.method==="GET"){
    (async()=>{const r=await binanceRestPublic("/api/v3/exchangeInfo"); if(!r.ok){const m=normalizeBinanceError(r);return error(res,m.code,m.message,m.status);} return send(res,r.status,r.json);})(); return;
  }
  // test order (SIGNED) – exchangeInfo doğrulama
  if(req.url==="/exchange/binance/order/test" && req.method==="POST"){
    return parseBody(req,res,async({symbol,side="BUY",type="MARKET",quantity,price,timeInForce})=>{
      if(!symbol) return error(res,"BAD_REQUEST","symbol gerekli",400);
      await ensureExchangeInfo(false);
      const chk=validateOrderQtyPrice(symbol,type,quantity,price); if(!chk.ok) return error(res,"BAD_REQUEST",chk.message,400);
      if(type==="MARKET" && !quantity) return error(res,"BAD_REQUEST","MARKET için quantity gerekli",400);
      if(type==="LIMIT" && (!price||!timeInForce)) return error(res,"BAD_REQUEST","LIMIT için price ve timeInForce gerekli",400);
      const r=await binanceRestSigned("POST","/api/v3/order/test",{symbol,side,type,quantity,price,timeInForce});
      if(!r.ok){const m=normalizeBinanceError(r);return error(res,m.code,m.message,m.status);}
      return send(res,200,r.json||{ok:true});
    });
  }
  // real order (SIGNED)
  if(req.url==="/exchange/binance/order" && req.method==="POST"){
    return parseBody(req,res,async({symbol,side="BUY",type="MARKET",quantity,price,timeInForce})=>{
      if(!symbol) return error(res,"BAD_REQUEST","symbol gerekli",400);
      await ensureExchangeInfo(false);
      const chk=validateOrderQtyPrice(symbol,type,quantity,price); if(!chk.ok) return error(res,"BAD_REQUEST",chk.message,400);
      if(type==="MARKET" && !quantity) return error(res,"BAD_REQUEST","MARKET için quantity gerekli",400);
      if(type==="LIMIT" && (!price||!timeInForce)) return error(res,"BAD_REQUEST","LIMIT için price ve timeInForce gerekli",400);
      const params={symbol,side,type,quantity,price,timeInForce,newClientOrderId:`bb-${Date.now()}`};
      const r=await binanceRestSigned("POST","/api/v3/order",params);
      if(!r.ok){const m=normalizeBinanceError(r);return error(res,m.code,m.message,m.status);}
      return send(res,r.status,r.json);
    });
  }
  // cancel order (SIGNED)
  if(req.url==="/exchange/binance/order" && req.method==="DELETE"){
    return parseBody(req,res,async({symbol,orderId,origClientOrderId})=>{
      if(!symbol || (!orderId && !origClientOrderId)) return error(res,"BAD_REQUEST","symbol ve (orderId|origClientOrderId) zorunlu",400);
      const r=await binanceRestSigned("DELETE","/api/v3/order",{symbol,orderId,origClientOrderId});
      if(!r.ok){const m=normalizeBinanceError(r);return error(res,m.code,m.message,m.status);}
      return send(res,r.status,r.json);
    });
  }

  // ===== FUTURES TEST STUB =====
  if(req.url==="/tests/backtest/futures" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    return parseBody(req,res,({symbol,timeframe,leverage=5,marginMode="cross"})=>{
      const result={market:"futures",symbol,timeframe,leverage,marginMode,
        pnl:(Math.random()*3000-1000).toFixed(2), winrate:Number((Math.random()*0.3+0.5).toFixed(2)),
        maxDrawdown:Number((Math.random()*0.2).toFixed(2)),
        trades:[{time:new Date().toISOString(),side:"long",qty:0.1,price:42000,result:120}]};
      return send(res,200,result);
    });
  }
  if(req.url==="/tests/active/futures" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    return parseBody(req,res,({symbol,leverage=5,marginMode="cross"})=>{
      return send(res,200,{market:"futures",symbol,leverage,marginMode,status:"running",startedAt:new Date().toISOString()});
    });
  }

  // ===== ROBOTS (spot+futures) =====
  if(req.url==="/robots" && req.method==="GET"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    return send(res,200,{items:readRobots()});
  }
  if(req.url==="/robots" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    return parseBody(req,res,(body)=>{
      if(!body.symbol) return error(res,"BAD_REQUEST","symbol gerekli",400);
      if(!["buy","sell","long","short"].includes(body.side)) return error(res,"BAD_REQUEST","side hatalı",400);
      if(body.market && !["spot","futures"].includes(body.market)) return error(res,"BAD_REQUEST","market hatalı",400);
      const r={id:randomUUID(), name:body.name||`Robot – ${body.symbol||"SYMBOL"} – ${body.side||"side"}`,
        market:body.market||"spot", symbol:body.symbol, side:body.side, status:"active",
        leverage: body.market==="futures"? (body.leverage||5): undefined,
        marginMode: body.market==="futures"? (body.marginMode||"cross"): undefined,
        schedule: body.schedule || { mode:"immediate" },
        params: body.params || {},
        createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};
      const list=readRobots(); list.push(r); writeRobots(list);
      auditLog("robot.create",{id:r.id,market:r.market,symbol:r.symbol,side:r.side},user);
      return send(res,201,r);
    });
  }
  if(req.url?.startsWith("/robots/") && req.method==="PATCH"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    const id=req.url.split("/")[2];
    return parseBody(req,res,(body)=>{
      if(body.market && !["spot","futures"].includes(body.market)) return error(res,"BAD_REQUEST","market hatalı",400);
      if(body.side && !["buy","sell","long","short"].includes(body.side)) return error(res,"BAD_REQUEST","side hatalı",400);
      if(body.status && !["active","paused","stopped"].includes(body.status)) return error(res,"BAD_REQUEST","status hatalı",400);
      const list=readRobots(); const idx=list.findIndex(x=>x.id===id); if(idx===-1) return error(res,"NOT_FOUND","robot not found",404);
      list[idx]={...list[idx],...body,updatedAt:new Date().toISOString()}; writeRobots(list);
      auditLog("robot.update",{id,patch:body},user);
      return send(res,200,list[idx]);
    });
  }
  if(req.url?.startsWith("/robots/") && req.method==="DELETE"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    const id=req.url.split("/")[2];
    const list=readRobots(); if(!list.some(x=>x.id===id)) return error(res,"NOT_FOUND","robot not found",404);
    writeRobots(list.filter(x=>x.id!==id)); auditLog("robot.delete",{id},user);
    res.writeHead(204,{"Access-Control-Allow-Origin":"*"}); return res.end();
  }
  // RUN robot (mock execution → reporting + robot-exec publish + (opsiyonel) notifier)
  if(req.url?.startsWith("/robots/") && req.method==="POST" && req.url.endsWith("/run")){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    const id = req.url.split("/")[2];
    return parseBody(req,res,async({qty=0.1,price=42000})=>{
      const list=readRobots(); const rob=list.find(x=>x.id===id);
      if(!rob) return error(res,"NOT_FOUND","robot not found",404);
      const exec={ robotId:rob.id, symbol:rob.symbol, side:rob.side, qty, price, pnl:Number((Math.random()*200-100).toFixed(2)), ts:new Date().toISOString() };
      if(REPORTING_URL){
        await safeFetch(`${REPORTING_URL}/execs`,{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(exec) });
      }
      if(ROBOT_EXEC_URL){
        await safeFetch(`${ROBOT_EXEC_URL}/run`,{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ robot: rob, exec }) });
      }
      auditLog("robot.run",{id:rob.id,market:rob.market,exec},user);
      await notifyAdmins({ type:"email", to:"admin@binnbot.com", subject:`Robot Run: ${rob.name}`, msg:`Robot ${rob.name} çalıştı: ${exec.symbol} ${exec.side} qty=${exec.qty} pnl=${exec.pnl}` });
      return send(res,200,{ ok:true, exec });
    });
  }

  // ===== NOTIFIER proxy =====
  if(req.url==="/notify" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!NOTIFIER_URL) return error(res,"UPSTREAM_ERROR","notifier yok",502);
    return parseBody(req,res,async(body)=>{
      const r=await safeFetch(`${NOTIFIER_URL}/notify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      return send(res, r.ok?r.status:502, r.json);
    });
  }

  // ===== EMERGENCY STOP =====
  if(req.url==="/admin/emergency-stop" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin"])) return error(res,"FORBIDDEN","role required",403);
    return parseBody(req,res,({scope="spot",mode="dry-run",reason="",includeOpenOrders=false,symbols=[]})=>{
      const key=`es-${Date.now()}`; const code="000000";
      approvals.set(key,{req:{scope,mode,reason:String(reason||""),includeOpenOrders:Boolean(includeOpenOrders),symbols:Array.isArray(symbols)?symbols:[]}, approvals:new Set([user.sub]), executed:false, code});
      auditLog("emergency.request",{key,scope,mode,reason,includeOpenOrders,symbols},user);
      return send(res,200,{ key, require2FA:true, codeHint:"000000" });
    });
  }
  if(req.url==="/admin/emergency-stop/approve" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin"])) return error(res,"FORBIDDEN","role required",403);
    return parseBody(req,res,async({key,code})=>{
      const rec=approvals.get(key); if(!rec) return error(res,"NOT_FOUND","request not found",404);
      if(rec.executed) return error(res,"BAD_REQUEST","already executed",400);
      if(code!==rec.code) return error(res,"BAD_REQUEST","2FA invalid",400);
      rec.approvals.add(user.sub);
      if(rec.approvals.size<2){
        auditLog("emergency.approve.partial",{key},user);
        return send(res,200,{ key, status:"waiting-second-approval" });
      }
      rec.executed=true;
      const executedActions = {
        scope: rec.req.scope,
        closedPositions: rec.req.scope!=="spot" ? 3 : 0,
        canceledOrders: rec.req.includeOpenOrders ? 5 : 0,
        symbols: rec.req.symbols
      };
      auditLog("emergency.execute",{key, ...executedActions, reason:rec.req.reason},user);
      await notifyAdmins({ type:"email", to:"admin@binnbot.com", subject:`Emergency Stop Executed (${rec.req.scope})`,
        msg:`Mode=${rec.req.mode} Reason="${rec.req.reason}" Symbols=${rec.req.symbols.join(",")||"-"} Closed=${executedActions.closedPositions} Canceled=${executedActions.canceledOrders}` });
      return send(res,200,{ key, status:"executed", ...executedActions });
    });
  }
  if(req.url==="/admin/emergency-stop/requests" && req.method==="GET"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin"])) return error(res,"FORBIDDEN","role required",403);
    const list=[...approvals.entries()].map(([key,v])=>({key,req:v.req, approvals:[...v.approvals], executed:v.executed}));
    return send(res,200,{items:list});
  }

  // ===== REPORTS proxy =====
  if(req.url.startsWith("/reports/execs") && req.method==="GET"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(REPORTING_URL){
      (async()=>{const qs=req.url.includes("?")?req.url.slice(req.url.indexOf("?")):""; const r=await safeFetch(`${REPORTING_URL}/execs${qs}`); return send(res,r.ok?r.status:502,r.json);})(); return;
    } else { return send(res,200,[]); }
  }
  if(req.url.startsWith("/reports/summary") && req.method==="GET"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(REPORTING_URL){
      (async()=>{const qs=req.url.includes("?")?req.url.slice(req.url.indexOf("?")):""; const r=await safeFetch(`${REPORTING_URL}/summary${qs}`); return send(res,r.ok?r.status:502,r.json);})(); return;
    } else {
      return send(res,200,{ pnlTotal:42031, winrate:0.61, maxDrawdown:0.22, pnlDaily:[{date:"2025-08-01",pnl:1200},{date:"2025-08-02",pnl:-340}] });
    }
  }

  // ===== SCANNER proxy =====
  if(req.url==="/scanner/templates" && req.method==="GET"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(SCANNER_URL){
      (async()=>{const r=await safeFetch(`${SCANNER_URL}/templates`); return send(res,r.ok?r.status:502,r.json);})(); return;
    } else {
      return send(res,200,[ {key:"trend-strong",name:"Güçlü Trend Coinler",market:"spot"}, {key:"rsi-oversold",name:"RSI Düşük (Alım Fırsatı)",market:"spot"} ]);
    }
  }
  if(req.url==="/scanner/search" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    return parseBody(req,res,async(body)=>{
      const {template,rules}=body||{}; const hasT=typeof template==="string"&&template.length>0; const hasR=Array.isArray(rules)&&rules.length>0;
      if(!hasT && !hasR) return error(res,"BAD_REQUEST","template veya rules zorunlu",400);
      if(SCANNER_URL){
        const r=await safeFetch(`${SCANNER_URL}/search`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
        return send(res,r.ok?r.status:502,r.json);
      } else {
        return send(res,200,[ {symbol:"BTCUSDT",change24h:0.034,volume24h:250000000,score:0.82}, {symbol:"ETHUSDT",change24h:0.028,volume24h:180000000,score:0.74} ]);
      }
    });
  }

  // fallback
  return error(res,"NOT_FOUND","not found",404);
});

// === Dashboard WS (market verisi/dummy) ===
const wss=new WebSocketServer({port:8090});
setInterval(()=>{
  if(wss.clients.size===0) return;
  const data=JSON.stringify({
    ts:new Date().toISOString(),
    pnlDaily:Number((Math.random()*500-200).toFixed(2)),
    openPositions:Math.floor(Math.random()*5),
    activeRobots:Math.floor(Math.random()*20)+1,
    symbols:DASHBOARD_SYMBOLS.map(s=>({symbol:s,bid:null,ask:null,ts:null}))
  });
  for(const c of wss.clients){try{c.send(data)}catch{}}
},5000);

server.listen(8080,()=>console.log("api-gateway running on :8080 | ws://localhost:8090"));
