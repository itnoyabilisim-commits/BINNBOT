import { useState } from "react";

export default function Tests() {
  const [tab,setTab]=useState("backtest-spot");
  return (
    <div style={{maxWidth:1000,margin:"40px auto",padding:20}}>
      <h1>🧪 Testler</h1>
      <div style={{margin:"16px 0"}}>
        <button onClick={()=>setTab("backtest-spot")}>Backtest Spot</button>
        <button onClick={()=>setTab("backtest-futures")}>Backtest Vadeli</button>
        <button onClick={()=>setTab("active-spot")}>ActiveTest Spot</button>
        <button onClick={()=>setTab("active-futures")}>ActiveTest Vadeli</button>
      </div>
      <div style={{padding:20,background:"#121824",borderRadius:12}}>
        <h3>Seçilen: {tab}</h3>
        <p>Burada parametre formu ve dummy sonuç tablosu yer alacak.</p>
      </div>
    </div>
  )
}
