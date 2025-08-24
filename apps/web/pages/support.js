// apps/web/pages/support.js
import { useState } from "react";

export default function Support() {
  const [tickets, setTickets] = useState([
    { id: 1, subject: "API anahtarımı nasıl eklerim?", status: "Açık" },
    { id: 2, subject: "Ücretsiz planda robot kurabilir miyim?", status: "Kapalı" }
  ]);
  const [input, setInput] = useState("");

  function addTicket() {
    if (!input) return;
    const newT = { id: Date.now(), subject: input, status: "Açık" };
    setTickets([...tickets, newT]);
    setInput("");
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Destek Merkezi</h1>

      {/* SSS */}
      <section style={{ marginTop: "20px" }}>
        <h2>Sık Sorulan Sorular</h2>
        <ul>
          <li>API anahtarlarım güvenli mi? → AES-256 ile saklanır, çekim izni verilmez.</li>
          <li>Ücretsiz planda Binance hesabı gerekir mi? → Hayır, sanal para ile test yapılır.</li>
          <li>Mobil uygulama var mı? → Evet, iOS ve Android desteklenir.</li>
        </ul>
      </section>

      {/* Ticket */}
      <section style={{ marginTop: "40px" }}>
        <h2>Destek Taleplerim</h2>
        <ul>
          {tickets.map(t => (
            <li key={t.id}>
              #{t.id} – {t.subject} ({t.status})
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "15px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Yeni talep konusu..."
            style={{ padding: "8px", width: "60%" }}
          />
          <button
            onClick={addTicket}
            style={{
              marginLeft: "10px",
              background: "#F4B400",
              border: "none",
              padding: "8px 15px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Gönder
          </button>
        </div>
      </section>

      {/* Eğitim Videoları */}
      <section style={{ marginTop: "40px" }}>
        <h2>Eğitim Videoları (Dummy)</h2>
        <ul>
          <li>🎥 Backtest nedir, nasıl kullanılır?</li>
          <li>🎥 Active Test nasıl yapılır?</li>
          <li>🎥 Binance hesabını bağlama</li>
          <li>🎥 Spot robot kurulumu</li>
          <li>🎥 Vadeli robot kurulumu</li>
          <li>🎥 Symbol tarama mantığı</li>
        </ul>
      </section>
    </div>
  );
}
