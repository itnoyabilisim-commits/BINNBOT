// apps/web/pages/tests.js
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Tests(){
  const [tab,setTab]=useState("active-spot");
  const [msg,setMsg]=useState("");
  const [resp,setResp]=useState(null);

  // Futures form state
  const [futSymbol, setFutSymbol] = useState("BTCUSDT");
  const [futTimeframe, setFutTimeframe] = useState("1h");
  const [futLev, setFutLev] = useState(5);
  const [futMM, setFutMM] = useState("cross");

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
          <div style={{ display:"flex", gap:8, alignItems:"end", flexWrap:"wrap" }}>
            <div>
              <label>Symbol</label><br/>
              <input value={futSymbol} onChange={e=>setFutSymbol(e.target.value.toUpperCase())}/>
            </div>
            <div>
              <label>Leverage</label><br/>
              <input type="number" min={1} max={125} value={futLev} onChange={e=>setFutLev(Number(e.target.value||5))}/>
            </div>
            <div>
              <label>Margin Mode</label><br/>
              <select value={futMM} onChange={e=>setFutMM(e.target.value)}>
                <option value="cross">cross</option>
                <option value="isolated">isolated</option>
              </select>
            </div>
            <button onClick={()=>run("/tests/active/futures",{symbol:futSymbol,leverage:futLev,marginMode:futMM})}>Başlat</button>
          </div>
        </section>
      )}

      {tab==="backtest-fut" && (
        <section>
          <h3>Backtest – Futures</h3>
          <div style={{ display:"flex", gap:8, alignItems:"end", flexWrap:"wrap" }}>
            <div>
              <label>Symbol</label><br/>
              <input value={futSymbol} onChange={e=>setFutSymbol(e.target.value.toUpperCase())}/>
            </div>
            <div>
              <label>Timeframe</label><br/>
              <select value={futTimeframe} onChange={e=>setFutTimeframe(e.target.value)}>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
                <option value="1d">1d</option>
              </select>
            </div>
            <div>
              <label>Leverage</label><br/>
              <input type="number" min={1} max={125} value={futLev} onChange={e=>setFutLev(Number(e.target.value||5))}/>
            </div>
            <div>
              <label>Margin Mode</label><br/>
              <select value={futMM} onChange={e=>setFutMM(e.target.value)}>
                <option value="cross">cross</option>
                <option value="isolated">isolated</option>
              </select>
            </div>
            <button onClick={()=>run("/tests/backtest/futures",{symbol:futSymbol,timeframe:futTimeframe,leverage:futLev,marginMode:futMM})}>Çalıştır</button>
          </div>
        </section>
      )}

      {msg && <p style={{ color:"crimson" }}>{msg}</p>}
      {resp && <pre style={{ background:"#f7f7f7", padding:12 }}>{JSON.stringify(resp,null,2)}</pre>}
    </div>
  );
}
