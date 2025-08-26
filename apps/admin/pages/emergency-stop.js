// apps/admin/pages/emergency-stop.js
import { useEffect, useState } from "react";
const GW = "http://localhost:8080";

async function jpost(path, body){
  const r = await fetch(`${GW}${path}`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken")||""}` : ""
    },
    body: JSON.stringify(body||{})
  });
  const t = await r.text(); try{return { ok:r.ok, status:r.status, json: t?JSON.parse(t):null }}catch{return {ok:r.ok,status:r.status,json:{ raw:t }}}
}
async function jget(path){
  const r = await fetch(`${GW}${path}`, {
    headers:{
      "Authorization": typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken")||""}` : ""
    }
  });
  const t = await r.text(); try{return { ok:r.ok, status:r.status, json: t?JSON.parse(t):null }}catch{return {ok:r.ok,status:r.status,json:{ raw:t }}}
}

export default function EmergencyStop(){
  const [scope,setScope]=useState("spot");
  const [mode,setMode]=useState("dry-run");
  const [reason,setReason]=useState("");
  const [includeOO,setIncludeOO]=useState(false);
  const [symbols,setSymbols]=useState(""); // "BTCUSDT,ETHUSDT"
  const [key,setKey]=useState("");
  const [code,setCode]=useState("000000");
  const [resp,setResp]=useState(null);
  const [msg,setMsg]=useState("");
  const [pending,setPending]=useState([]);

  async function loadPending(){
    const r = await jget("/admin/emergency-stop/requests");
    if(r.ok) setPending(r.json.items||[]);
  }
  useEffect(()=>{ loadPending(); },[]);

  async function createReq(){
    setMsg("İstek oluşturuluyor..."); setResp(null);
    const symbolsArr = symbols.split(",").map(s=>s.trim().toUpperCase()).filter(Boolean);
    const r = await jpost("/admin/emergency-stop",{scope,mode,reason,includeOpenOrders:includeOO,symbols:symbolsArr});
    setResp(r); if(r.ok) setKey(r.json.key); setMsg("");
    loadPending();
  }
  async function approve(){
    if(!key) return setMsg("Key yok");
    setMsg("Onay gönderiliyor..."); setResp(null);
    const r = await jpost("/admin/emergency-stop/approve",{key,code});
    setResp(r); setMsg("");
    loadPending();
  }

  return (
    <div style={{ padding:20, fontFamily:"sans-serif" }}>
      <h1>Acil Stop</h1>
      <p style={{color:"#666"}}>Bu ekran yalnızca <b>Admin/SuperAdmin</b> için. 2FA kodu demo’da <b>000000</b>.</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, maxWidth:900 }}>
        <div>
          <label>Scope</label><br/>
          <select value={scope} onChange={e=>setScope(e.target.value)}>
            <option value="spot">spot</option>
            <option value="futures">futures</option>
            <option value="all">all</option>
          </select>
        </div>
        <div>
          <label>Mode</label><br/>
          <select value={mode} onChange={e=>setMode(e.target.value)}>
            <option value="dry-run">dry-run</option>
            <option value="execute">execute</option>
          </select>
        </div>
        <div>
          <label>Açık Emirleri de Kapsa</label><br/>
          <input type="checkbox" checked={includeOO} onChange={e=>setIncludeOO(e.target.checked)} />
        </div>

        <div style={{ gridColumn:"span 3" }}>
          <label>Semboller (virgüllü, opsiyonel)</label><br/>
          <input value={symbols} onChange={e=>setSymbols(e.target.value)} placeholder="BTCUSDT,ETHUSDT" style={{ width:"100%" }}/>
        </div>

        <div style={{ gridColumn:"span 3" }}>
          <label>Sebep (opsiyonel)</label><br/>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} style={{ width:"100%" }} />
        </div>
      </div>

      <div style={{ marginTop:12, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        <button onClick={createReq} style={{ background:"#F4B400", border:"none", padding:"8px 14px", borderRadius:6, cursor:"pointer" }}>İstek Oluştur</button>
        {key && (
          <>
            <span>Key:</span><code>{key}</code>
            <label>2FA</label>
            <input value={code} onChange={e=>setCode(e.target.value)} style={{ width:100 }}/>
            <button onClick={approve}>Onayla</button>
          </>
        )}
      </div>

      <h3 style={{ marginTop:16 }}>Pending İstekler</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse:"collapse", width:"100%" }}>
        <thead><tr style={{ background:"#eee" }}>
          <th>Key</th><th>Scope</th><th>Mode</th><th>Reason</th><th>Include OO</th><th>Symbols</th><th>Approvals</th><th>Executed</th>
        </tr></thead>
        <tbody>
          {(pending||[]).map((p,i)=>(
            <tr key={i}>
              <td>{p.key}</td>
              <td>{p.req?.scope}</td>
              <td>{p.req?.mode}</td>
              <td>{p.req?.reason || "-"}</td>
              <td>{String(p.req?.includeOpenOrders||false)}</td>
              <td>{(p.req?.symbols||[]).join(", ") || "-"}</td>
              <td>{(p.approvals||[]).join(", ")}</td>
              <td>{String(p.executed)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop:16 }}>Son Yanıt</h3>
      <pre style={{ background:"#f7f7f7", padding:12, borderRadius:6 }}>
        {resp ? JSON.stringify(resp, null, 2) : "—"}
      </pre>
    </div>
  );
}
