// services/api-gateway/index.js
import http from "http";
import { randomUUID } from "crypto";
import { WebSocketServer } from "ws";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { readRobots, writeRobots } from "./storage.js";
import { login, verify, issueToken, verifyToken, requireRole } from "./auth.js";
import {
  binanceRestPublic, binanceRestSigned, BINANCE_INFO, normalizeBinanceError
} from "../lib/binance.js";
import { ensureExchangeInfo, getSymbolFilters } from "../lib/exchangeInfo.js";

// ==== ENV ====
const SCANNER_URL       = process.env.SCANNER_URL       || "";
const REPORTING_URL     = process.env.REPORTING_URL     || "";
const INGESTOR_URL      = process.env.INGESTOR_URL      || "http://localhost:8091";
const NOTIFIER_URL      = process.env.NOTIFIER_URL      || "";
const DASHBOARD_SYMBOLS = (process.env.DASHBOARD_SYMBOLS || "BTCUSDT,ETHUSDT")
  .split(",").map(s=>s.trim().toUpperCase()).filter(Boolean);

// ==== RATE LIMIT ====
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 60);
const WINDOW_MS  = 60_000;
const rlMap = new Map();
function rateLimit(req, res){
  const ip=(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"")+""; const now=Date.now();
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
function preflight(req,res){if(req.method==="OPTIONS"){res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization"});res.end();return true}return false}

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

// ==== audit (append-only file) ====
const AUDIT_FILE = "services/api-gateway/tmp/audit.log";
(function ensureTmp(){try{mkdirSync("services/api-gateway/tmp",{recursive:true})}catch{}})();
function auditLog(event, payload, actor){
  const rec={ts:new Date().toISOString(),event,actor:actor?.sub||null,role:actor?.role||null,payload};
  try{const prev=existsSync(AUDIT_FILE)?readFileSync(AUDIT_FILE,"utf8")+"":"";
      writeFileSync(AUDIT_FILE, prev+JSON.stringify(rec)+"\n","utf8");}catch{}
}
function auditRead(limit=200){
  try{
    const txt = existsSync(AUDIT_FILE)?readFileSync(AUDIT_FILE,"utf8"):"";
    const lines = txt.trim()?txt.trim().split("\n"):[];
    return lines.slice(-limit).map(x=>{try{return JSON.parse(x)}catch{return {raw:x}}});
  }catch{return []}
}

// ==== emergency stop approval memory ====
const approvals = new Map(); // key -> {req, approvals:Set<email>, executed:boolean, code:string}

// ==== HTTP server ====
const server = http.createServer((req,res)=>{
  if(preflight(req,res)) return;
  if(!rateLimit(req,res)) return;

  // system
  if(req.url==="/healthz" && req.method==="GET"){res.writeHead(200);return res.end("ok");}

  // auth
  if(req.url==="/auth/login" && req.method==="POST"){
    return parseBody(req,res,({email,password})=>{
      try{ return send(res,200,login(email,password)); }catch(e){ return error(res,"BAD_REQUEST",e.message||"login failed",400); }
    });
  }
  if(req.url==="/auth/refresh" && req.method==="POST"){
    return parseBody(req,res,({refreshToken})=>{
      const pay=refreshToken?verifyToken(refreshToken,"refresh"):null;
      if(!pay) return error(res,"UNAUTHORIZED","invalid refresh token",401);
      const accessToken=issueToken(pay.sub,3600,"access",pay.role);
      return send(res,200,{accessToken,refreshToken,expiresIn:3600});
    });
  }

  // ===== FUTURES TEST UÇLARI (stub) =====
  if(req.url==="/tests/backtest/futures" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    return parseBody(req,res,({symbol,timeframe,leverage=5,marginMode="cross"})=>{
      const result={
        market:"futures",symbol,timeframe,leverage,marginMode,
        pnl: (Math.random()*3000-1000).toFixed(2),
        winrate: Number((Math.random()*0.3+0.5).toFixed(2)),
        maxDrawdown: Number((Math.random()*0.2).toFixed(2)),
        trades:[{time:new Date().toISOString(),side:"long",qty:0.1,price:42000,result:120}]
      };
      return send(res,200,result);
    });
  }
  if(req.url==="/tests/active/futures" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    return parseBody(req,res,({symbol,leverage=5,marginMode="cross"})=>{
      const result={ market:"futures",symbol,leverage,marginMode, status:"running", startedAt:new Date().toISOString() };
      return send(res,200,result);
    });
  }

  // ===== BINANCE basic (kısaltılmış) =====
  if(req.url==="/exchange/binance/ping" && req.method==="GET"){
    (async()=>{const r=await binanceRestPublic("/api/v3/ping"); if(!r.ok){const m=normalizeBinanceError(r);return error(res,m.code,m.message,m.status);} return send(res,r.status,{ping:"pong",base:BINANCE_INFO.BASE,sandbox:BINANCE_INFO.SANDBOX});})(); return;
  }

  // ===== ROBOTS (spot/futures) =====
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
      const r={id:randomUUID(),name:body.name||`Robot – ${body.symbol||"SYMBOL"} – ${body.side||"side"}`,
        market:body.market||"spot", symbol:body.symbol, side:body.side, status:"active",
        leverage: body.market==="futures"? (body.leverage||5): undefined,
        marginMode: body.market==="futures"? (body.marginMode||"cross"): undefined,
        schedule:body.schedule||{mode:"immediate"}, params:body.params||{},
        createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};
      const list=readRobots(); list.push(r); writeRobots(list);
      auditLog("robot.create", {id:r.id,market:r.market,symbol:r.symbol,side:r.side}, user);
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
      list[idx]={...list[idx],...body, updatedAt:new Date().toISOString()}; writeRobots(list);
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

  // ===== NOTIFIER proxy =====
  if(req.url==="/notify" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!NOTIFIER_URL) return error(res,"UPSTREAM_ERROR","notifier yok",502);
    return parseBody(req,res,async(body)=>{
      const r=await safeFetch(`${NOTIFIER_URL}/notify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      return send(res, r.ok?r.status:502, r.json);
    });
  }

  // ===== ADMIN EMERGENCY STOP =====
  // 1) İstek oluştur (dry-run/execute), 2FA kodu üret (stub)
  if(req.url==="/admin/emergency-stop" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin"])) return error(res,"FORBIDDEN","role required",403);
    return parseBody(req,res,({scope="spot",mode="dry-run"})=>{
      const key = `es-${Date.now()}`;
      const code = "000000"; // stub 2FA (normalde e-posta/SMS ile gönderilir)
      approvals.set(key,{ req:{scope,mode}, approvals:new Set([user.sub]), executed:false, code });
      auditLog("emergency.request",{key,scope,mode},user);
      return send(res,200,{ key, require2FA:true, codeHint:"000000 (stub)" });
    });
  }
  // 2) Onay/Çift onay + 2FA doğrulama + (execute ise) uygulama
  if(req.url==="/admin/emergency-stop/approve" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin"])) return error(res,"FORBIDDEN","role required",403);
    return parseBody(req,res,({key,code})=>{
      const rec=approvals.get(key); if(!rec) return error(res,"NOT_FOUND","request not found",404);
      if(rec.executed) return error(res,"BAD_REQUEST","already executed",400);
      if(code!==rec.code) return error(res,"BAD_REQUEST","2FA invalid",400);
      rec.approvals.add(user.sub);
      if(rec.approvals.size<2){ // çift onay bekleniyor
        auditLog("emergency.approve.partial",{key,approver:user.sub},user);
        return send(res,200,{ key, status:"waiting-second-approval" });
      }
      // çift onay tamam → uygula (stub)
      rec.executed=true;
      auditLog("emergency.execute",{key,scope:rec.req.scope,mode:rec.req.mode},user);
      return send(res,200,{ key, status:"executed", scope:rec.req.scope, mode:rec.req.mode });
    });
  }

  // ===== AUDIT read =====
  if(req.url==="/admin/audit" && req.method==="GET"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin","Analyst"])) return error(res,"FORBIDDEN","role required",403);
    const items=auditRead(200);
    return send(res,200,{items});
  }

  // fallback
  return error(res,"NOT_FOUND","not found",404);
});

// === Dashboard WS (dummy; daha önce eklediysen aynen bırakılabilir) ===
const wss = new WebSocketServer({ port: 8090 });
setInterval(async ()=>{
  if(wss.clients.size===0) return;
  const data = JSON.stringify({
    pnlDaily: Number((Math.random()*500-200).toFixed(2)),
    openPositions: Math.floor(Math.random()*5),
    activeRobots: Math.floor(Math.random()*20)+1,
    symbols: DASHBOARD_SYMBOLS.map(s=>({symbol:s,bid:null,ask:null,ts:null})),
    ts: new Date().toISOString()
  });
  for(const c of wss.clients){try{c.send(data)}catch{}}
}, 5000);

server.listen(8080,()=>console.log("api-gateway running on :8080 | ws://localhost:8090"));
