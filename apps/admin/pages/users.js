// apps/admin/pages/users.js
import { useEffect, useState } from "react";
const GW = "http://localhost:8080";

// helper: auth GET
async function jgetAuth(path) {
  const r = await fetch(`${GW}${path}`, {
    headers: { "Authorization": typeof window!=="undefined" ? `Bearer ${localStorage.getItem("accessToken")||""}` : "" }
  });
  const t = await r.text(); try { return { ok:r.ok, status:r.status, json: t?JSON.parse(t):null } } catch { return { ok:r.ok, status:r.status, json:{ raw:t } } }
}
// helper: auth POST
async function jpostAuth(path, body) {
  const r = await fetch(`${GW}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": typeof window!=="undefined" ? `Bearer ${localStorage.getItem("accessToken")||""}` : ""
    },
    body: JSON.stringify(body||{})
  });
  const t = await r.text(); try { return { ok:r.ok, status:r.status, json: t?JSON.parse(t):null } } catch { return { ok:r.ok, status:r.status, json:{ raw:t } } }
}
// helper: refresh (explicit)
async function refreshAccess() {
  const rt = typeof window!=="undefined" ? localStorage.getItem("refreshToken") : null;
  if (!rt) throw new Error("refreshToken yok");
  const r = await fetch(`${GW}/auth/refresh`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: rt })
  });
  if (!r.ok) throw new Error("refresh başarısız");
  const data = await r.json();
  localStorage.setItem("accessToken", data.accessToken);
  return data;
}
// helper: JWT decode (payload.role göstermek için)
function decodeRoleFromAccess() {
  try {
    const tok = localStorage.getItem("accessToken") || "";
    const p = tok.split(".")[1]; if (!p) return null;
    const json = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
    return json.role || null;
  } catch { return null; }
}

export default function UsersAdmin(){
  const [roles,setRoles]=useState({});
  const [email,setEmail]=useState("");
  const [role,setRole]=useState("Support");
  const [msg,setMsg]=useState("");
  const [myRole, setMyRole] = useState(decodeRoleFromAccess());

  async function load(){
    setMsg("Yükleniyor...");
    const r = await jgetAuth("/admin/roles");
    if(r.ok) { setRoles(r.json.roles||{}); setMsg(""); } else { setMsg("Rol listesi alınamadı"); }
    setMyRole(decodeRoleFromAccess());
  }
  useEffect(()=>{ load(); },[]);

  async function save(){
    setMsg("Kaydediliyor...");
    const r = await jpostAuth("/admin/roles", { email, role });
    if(r.ok){ setRoles(r.json.roles||{}); setMsg("Kaydedildi"); setEmail(""); setRole("Support"); }
    else setMsg("Kaydedilemedi");
  }

  async function doRefresh() {
    try {
      setMsg("Rol yenileniyor...");
      await refreshAccess();
      setMyRole(decodeRoleFromAccess());
      setMsg("Rol yenilendi");
    } catch (e) {
      setMsg("Refresh hata: " + e.message);
    }
  }

  return (
    <div style={{ padding:20, fontFamily:"sans-serif" }}>
      <h1>Kullanıcı & Roller</h1>
      <p style={{ color:"#666" }}>
        Bu sayfa <b>SuperAdmin</b> içindir. E-posta adresine rol atayabilirsin.
        <br/>
        <b>Mevcut rolün:</b> <code>{myRole || "-"}</code>
        <button onClick={doRefresh} style={{ marginLeft: 8 }}>Rolü Yenile</button>
      </p>

      <div style={{ display:"flex", gap:8, alignItems:"end", flexWrap:"wrap" }}>
        <div>
          <label>E-posta</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="kisi@ornek.com" style={{ width: 260 }}/>
        </div>
        <div>
          <label>Rol</label><br/>
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option>SuperAdmin</option>
            <option>Admin</option>
            <option>Support</option>
            <option>Moderator</option>
            <option>Analyst</option>
            <option>Billing</option>
          </select>
        </div>
        <button onClick={save}>Ata / Güncelle</button>
        <button onClick={load}>Yenile</button>
      </div>

      {msg && <p style={{ color:"#b00" }}>{msg}</p>}

      <h3 style={{ marginTop:16 }}>Mevcut Roller</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse:"collapse", width:"100%" }}>
        <thead><tr style={{ background:"#eee" }}><th>E-posta</th><th>Rol</th></tr></thead>
        <tbody>
          {Object.entries(roles).map(([k,v])=>(
            <tr key={k}><td>{k}</td><td>{v}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
