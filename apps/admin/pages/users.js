// services/api-gateway/auth.js
import { createHmac, randomUUID } from "crypto";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";

const SECRET = process.env.JWT_SECRET || "supersecret123";
const ROLES_FILE = "services/api-gateway/tmp/roles.json";

// default rol
const DEFAULT_ROLE = "Support";

// ensure tmp dir
try { mkdirSync("services/api-gateway/tmp", { recursive: true }); } catch {}

// read roles mapping from file
function readRoles() {
  try {
    if (!existsSync(ROLES_FILE)) {
      writeFileSync(ROLES_FILE, JSON.stringify({ "superadmin@binnbot.com": "SuperAdmin", "admin@binnbot.com": "Admin" }, null, 2), "utf-8");
    }
    return JSON.parse(readFileSync(ROLES_FILE, "utf-8") || "{}");
  } catch {
    return {};
  }
}

export function setRole(email, role) {
  const roles = readRoles();
  roles[email.toLowerCase()] = role;
  writeFileSync(ROLES_FILE, JSON.stringify(roles, null, 2), "utf-8");
  return roles;
}
export function getAllRoles() {
  return readRoles();
}
function getRoleForEmail(email) {
  const roles = readRoles();
  return roles[email.toLowerCase()] || DEFAULT_ROLE;
}

// base64url helpers
function b64url(s){return Buffer.from(s).toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");}
function b64urlJSON(o){return b64url(JSON.stringify(o));}
function fromB64url(str){str=str.replace(/-/g,"+").replace(/_/g,"/");while(str.length%4)str+="=";return Buffer.from(str,"base64").toString();}

// token
export function issueToken(sub, ttlSec = 3600, kind = "access", role = DEFAULT_ROLE) {
  const now = Math.floor(Date.now()/1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { sub, role, iat: now, exp: now+ttlSec, jti: randomUUID(), t: kind };
  const h = b64urlJSON(header), p = b64urlJSON(payload);
  const sig = createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  return `${h}.${p}.${sig}`;
}
export function verifyToken(token, expectedKind = "access") {
  try{
    const [h,p,s]=token.split(".");
    if(!h||!p||!s) return null;
    const sig = createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
    if(sig!==s) return null;
    const pay = JSON.parse(fromB64url(p));
    if(pay.t!==expectedKind) return null;
    if(pay.exp && pay.exp < Math.floor(Date.now()/1000)) return null;
    return pay; // {sub, role, ...}
  }catch{return null;}
}

// public API
export function login(email, password){
  if(!email||!password) throw new Error("email/password required");
  const role = getRoleForEmail(String(email).toLowerCase());
  const accessToken  = issueToken(email, 3600, "access", role);
  const refreshToken = issueToken(email, 7*24*3600, "refresh", role);
  return { accessToken, refreshToken, expiresIn: 3600, role };
}

export function verify(req){
  const h = req.headers["authorization"]||"";
  if(!h.startsWith("Bearer ")) return null;
  return verifyToken(h.slice(7),"access");
}

export function requireRole(payload, roles){
  if(!payload) return false;
  return roles.includes(payload.role);
}
