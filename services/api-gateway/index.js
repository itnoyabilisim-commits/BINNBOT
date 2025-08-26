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
const SCANNER_URL   = process.env.SCANNER_URL   || "";
const REPORTING_URL = process.env.REPORTING_URL || "";
const INGESTOR_URL  = process.env.INGESTOR_URL  || "http://localhost:8091";
const NOTIFIER_URL  = process.env.NOTIFIER_URL  || "";
const DASHBOARD_SYMBOLS = (process.env.DASHBOARD_SYMBOLS || "BTCUSDT,ETHUSDT")
  .split(",").map(s=>s.trim().toUpperCase()).filter(Boolean);

// ==== RATE LIMIT ====
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 60);
const WINDOW_MS  = 60_000;
const rlMap = new Map();
function rateLimit(req,res){
  const ip=(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"")+""; 
  const now=Date.now();
  const e=rlMap.get(ip)||{count:0,start:now};
  if(now-e.start>WINDOW_MS){e.count=0;e.start=now;}
  e.count++; rlMap.set(ip,e);
  if(e.count>RATE_LIMIT){
    res.writeHead(429,{"Content-Type":"application/json","Retry-After":"60","Access-Control-Allow-Origin":"*"});
    res.end(JSON.stringify({code:"RATE_LIMIT",message:"Too many requests"}));
    return false;
  } return true;
}

// ==== helpers ====
function send(res,code,data,hdrs={}){const h={"Content-Type":"application/json","Access-Control-Allow-Origin":"*",...hdrs};res.writeHead(code,h);res.end(typeof data==="string"?data:JSON.stringify(data));}
function error(res, code, message, status=400, hdrs={}){return send(res,status,{code,message},hdrs);}
function parseBody(req,res,cb){let b="";req.on("data",c=>b+=c);req.on("end",()=>{try{cb(JSON.parse(b||"{}"))}catch{return error(res,"BAD_REQUEST","invalid JSON",400)}});}
async function safeFetch(url, init){try{const r=await fetch(url,init);const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch{j={raw:t}};return {ok:r.ok,status:r.status,json:j}}catch(e){return {ok:false,status:502,json:{code:"UPSTREAM_ERROR",message:String(e)}}}}
function preflight(req,res){if(req.method==="OPTIONS"){res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization"});res.end();return true}return false}

// ==== audit log ====
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
const approvals=new Map();

// ==== HTTP SERVER ====
const server=http.createServer((req,res)=>{
  if(preflight(req,res)) return;
  if(!rateLimit(req,res)) return;

  // system
  if(req.url==="/healthz" && req.method==="GET"){res.writeHead(200);return res.end("ok");}

  // auth
  if(req.url==="/auth/login" && req.method==="POST"){
    return parseBody(req,res,({email,password})=>{
      try{ return send(res,200,login(email,password)); }
      catch(e){ return error(res,"BAD_REQUEST",e.message,400); }
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

  // ===== FUTURES TEST STUB =====
  if(req.url==="/tests/backtest/futures" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    return parseBody(req,res,({symbol,timeframe,leverage=5,marginMode="cross"})=>{
      const result={market:"futures",symbol,timeframe,leverage,marginMode,
        pnl:(Math.random()*3000-1000).toFixed(2), winrate:0.6, maxDrawdown:0.2,
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
      const r={id:randomUUID(), name:body.name||`Robot – ${body.symbol||""} – ${body.side||""}`,
        market:body.market||"spot", symbol:body.symbol, side:body.side, status:"active",
        leverage: body.market==="futures"? (body.leverage||5): undefined,
        marginMode: body.market==="futures"? (body.marginMode||"cross"): undefined,
        createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};
      const list=readRobots(); list.push(r); writeRobots(list);
      auditLog("robot.create",{id:r.id,market:r.market},user);
      return send(res,201,r);
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
    return parseBody(req,res,({scope="spot",mode="dry-run"})=>{
      const key=`es-${Date.now()}`; const code="000000";
      approvals.set(key,{req:{scope,mode},approvals:new Set([user.sub]),executed:false,code});
      auditLog("emergency.request",{key,scope,mode},user);
      return send(res,200,{key,require2FA:true,codeHint:"000000"});
    });
  }
  if(req.url==="/admin/emergency-stop/approve" && req.method==="POST"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin"])) return error(res,"FORBIDDEN","role required",403);
    return parseBody(req,res,({key,code})=>{
      const rec=approvals.get(key); if(!rec) return error(res,"NOT_FOUND","request not found",404);
      if(code!==rec.code) return error(res,"BAD_REQUEST","2FA invalid",400);
      rec.approvals.add(user.sub);
      if(rec.approvals.size<2){
        auditLog("emergency.approve.partial",{key},user);
        return send(res,200,{key,status:"waiting-second-approval"});
      }
      rec.executed=true;
      auditLog("emergency.execute",{key,scope:rec.req.scope,mode:rec.req.mode},user);
      return send(res,200,{key,status:"executed",scope:rec.req.scope,mode:rec.req.mode});
    });
  }

  // ===== AUDIT read =====
  if(req.url==="/admin/audit" && req.method==="GET"){
    const user=verify(req); if(!user) return error(res,"UNAUTHORIZED","auth required",401);
    if(!requireRole(user,["SuperAdmin","Admin","Analyst"])) return error(res,"FORBIDDEN","role required",403);
    return send(res,200,{items:auditRead(200)});
  }

  return error(res,"NOT_FOUND","not found",404);
});

// WS dummy dashboard
const wss=new WebSocketServer({port:8090});
setInterval(()=>{
  if(wss.clients.size===0) return;
  const data=JSON.stringify({ts:new Date().toISOString(),pnlDaily:(Math.random()*500-200).toFixed(2)});
  for(const c of wss.clients){try{c.send(data)}catch{}}
},5000);

server.listen(8080,()=>console.log("api-gateway running on :8080 | ws://localhost:8090"));
