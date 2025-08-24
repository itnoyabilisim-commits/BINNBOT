// apps/web/pages/tests.js
import { useState } from "react";

export default function Tests() {
  const [tab, setTab] = useState("active");

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Testler</h1>

      {/* Sekmeler */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <button
          onClick={() => setTab("active")}
          style={{
            padding: "10px 20px",
            background: tab === "active" ? "#F4B400" : "#eee",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Active Test
        </button>
        <button
          onClick={() => setTab("backtest")}
          style={{
            padding: "10px 20px",
            background: tab === "backtest" ? "#F4B400" : "#eee",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Backtest
        </button>
      </div>

      {/* İçerikler */}
      {tab === "active" && (
        <section>
          <h2>Active Test (Dummy)</h2>
          <p>Burada spot/vadeli için aktif test seçenekleri olacak.</p>
          <ul>
            <li>İndikatör seçimi (SuperTrend, MACD, RSI vs.)</li>
            <li>Filtreler (EMA, ATR, ADX vs.)</li>
            <li>RSI ve SL/TP noktaları için anlık kontrol (dummy)</li>
          </ul>
        </section>
      )}

      {tab === "backtest" && (
        <section>
          <h2>Backtest (Dummy)</h2>
          <p>Burada spot/vadeli için geçmiş test seçenekleri olacak.</p>
          <ul>
            <li>Veri aralığı seçimi (başlangıç/bitiş tarihi)</li>
            <li>İndikatör parametreleri (dummy)</li>
            <li>Sonuç raporu: PnL, Winrate, Max DD (dummy)</li>
          </ul>
        </section>
      )}
    </div>
  );
}
