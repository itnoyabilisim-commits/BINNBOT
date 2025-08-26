// apps/admin/pages/emergency-stop.js
import { useState } from "react";

const GW = "http://localhost:8080";

async function jpost(path, body){
  const r = await fetch(`${GW}${path}`, { method:"POST", headers:{ "Content-Type":"application/json", "Authorization": localStorage.getItem("accessToken") ? `Bearer ${localStorage.getItem("accessToken")}` : "" }, body: JSON.stringify(body||{}) });
  const t = await r.text(); try{return { ok:r.ok, status:r.status, json: t?JSON.parse(t):null }}catch{return {ok:r.ok,status:r.status,json:{raw:t}}}
}

export default function EmergencyStop(){
  const [scope,setScope]=useState("spot");
  const [mode,setMode]=useState("dry-run");
  const [key,setKey]=useState("");
  const [code,setCode]=useState("000000");
  const [resp,setResp]=useState(null);
  const [msg,setMsg]=useState("");

  async function createReq(){
    setMsg("İstek oluşturuluyor..."); setResp(null);
    const r = await jpost("/admin/emergency-stop",{scope,mode});
    setResp(r); if(r.ok) setKey(r.json.key); setMsg("");
  }
  async function approve(){
    if(!key) return setMsg("Key yok");
    setMsg("Onay gönderiliyor..."); setResp(null);
    const r = await jpost("/admin/emergency-stop/approve",{key,code});
    setResp(r); setMsg("");
  }

  return (
    <div style={{ padding:20, fontFamily:"sans-serif" }}>
      <h1>Acil Stop</h1>
      <p style={{color:"#666"}}>Bu ekran yalnızca <b>Admin/SuperAdmin</b> içindir. 2FA kodu bu demo’da <b>000000</b>.</p>

      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        <label>Scope</label>
        <select value={scope} onChange={e=>setScope(e.target.value)}>
          <option value="spot">spot</option>
          <option value="futures">futures</option>
          <option value="all">all</option>
        </select>
        <label>Mode</label>
        <select value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="dry-run">dry-run</option>
          <option value="execute">execute</option>
        </select>
        <button onClick={createReq}>İstek Oluştur</button>
      </div>

      {key && (
        <div style={{ marginTop:12, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <span>Key:</span><code>{key}</code>
          <label>2FA Kodu</label>
          <input value={code} onChange={e=>setCode(e.target.value)} style={{ width:100 }}/>
          <button onClick={approve}>Onayla</button>
        </div>
      )}

      <h3 style={{ marginTop:16 }}>Son Yanıt</h3>
      <pre style={{ background:"#f7f7f7", padding:12 }}>{resp ? JSON.stringify(resp,null,2) : "—"}</pre>
    </div>
  );
}
