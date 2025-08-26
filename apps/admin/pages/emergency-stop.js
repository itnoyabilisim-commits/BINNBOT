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
  const [pending,setPending]=useState([]);
  const [msg,setMsg]=useState("");
  const [resp,setResp]=useState(null);

  async function loadPending(){
    const r = await jget("/admin/emergency-stop/requests");
    if(r.ok) setPending(r.json.items||[]);
  }
  useEffect(()=>{ loadPending(); },[]);

  async function approve(key){
    setMsg("Onay gönderiliyor...");
    const r = await jpost("/admin/emergency-stop/approve",{key,code:"000000"});
    setResp(r); setMsg("");
    loadPending();
  }

  return (
    <div style={{ padding:20, fontFamily:"sans-serif" }}>
      <h1>Acil Stop – Pending</h1>
      <button onClick={loadPending}>Yenile</button>
      {msg && <p>{msg}</p>}
      <table border="1" cellPadding="8" style={{ borderCollapse:"collapse", width:"100%", marginTop:10 }}>
        <thead><tr style={{ background:"#eee" }}>
          <th>Key</th><th>Scope</th><th>Mode</th><th>Reason</th><th>Approvals</th><th>Executed</th><th>Aksiyon</th>
        </tr></thead>
        <tbody>
          {(pending||[]).map((p,i)=>(
            <tr key={i}>
              <td>{p.key}</td>
              <td>{p.req?.scope}</td>
              <td>{p.req?.mode}</td>
              <td>{p.req?.reason || "-"}</td>
              <td>{(p.approvals||[]).join(",")}</td>
              <td>{String(p.executed)}</td>
              <td>{!p.executed && <button onClick={()=>approve(p.key)}>Onayla</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop:16 }}>Son Yanıt</h3>
      <pre style={{ background:"#f7f7f7", padding:12 }}>
        {resp ? JSON.stringify(resp, null, 2) : "—"}
      </pre>
    </div>
  );
}
