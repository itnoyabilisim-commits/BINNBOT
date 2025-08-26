// apps/web/pages/tests.js
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Tests(){
  const [tab,setTab]=useState("active-spot");
  const [msg,setMsg]=useState("");
  const [resp,setResp]=useState(null);

  async function run(path, body){
    setMsg("Çalıştırılıyor..."); setResp(null);
    try{const r=await apiPost(path, body); setResp(r); setMsg("");}
    catch(e){setMsg("Hata: "+e.message);}
  }

  return (
    <div style={{ padding:30, fontFamily:"sans-serif" }}>
      <h1>Testler</h1>

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <button onClick={()=>setTab("active-spot")}  style={{ background:tab==="active-spot"?"#F4B400":"#eee" }}>Active (Spot)</button>
        <button onClick={()=>setTab("backtest-spot")}style={{ background:tab==="backtest-spot"?"#F4B400":"#eee" }}>Backtest (Spot)</button>
        <button onClick={()=>setTab("active-fut")}   style={{ background:tab==="active-fut"?"#F4B400":"#eee" }}>Active (Futures)</button>
        <button onClick={()=>setTab("backtest-fut")} style={{ background:tab==="backtest-fut"?"#F4B400":"#eee" }}>Backtest (Futures)</button>
      </div>

      {tab==="active-spot" && (
        <section>
          <h3>Active Test – Spot (dummy)</h3>
          <button onClick={()=>run("/tests/backtest/spot",{symbol:"BTCUSDT",timeframe:"15m",params:{}})}>Örnek çalıştır</button>
        </section>
      )}

      {tab==="backtest-spot" && (
        <section>
          <h3>Backtest – Spot (dummy)</h3>
          <button onClick={()=>run("/tests/backtest/spot",{symbol:"BTCUSDT",timeframe:"1h",params:{}})}>Örnek çalıştır</button>
        </section>
      )}

      {tab==="active-fut" && (
        <section>
          <h3>Active Test – Futures</h3>
          <button onClick={()=>run("/tests/active/futures",{symbol:"BTCUSDT",leverage:5,marginMode:"cross"})}>Başlat</button>
        </section>
      )}

      {tab==="backtest-fut" && (
        <section>
          <h3>Backtest – Futures</h3>
          <button onClick={()=>run("/tests/backtest/futures",{symbol:"BTCUSDT",timeframe:"1h",leverage:5,marginMode:"cross"})}>Çalıştır</button>
        </section>
      )}

      {msg && <p style={{ color:"crimson" }}>{msg}</p>}
      {resp && <pre style={{ background:"#f7f7f7", padding:12 }}>{JSON.stringify(resp,null,2)}</pre>}
    </div>
  );
}
