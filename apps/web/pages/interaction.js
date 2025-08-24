// apps/web/pages/interaction.js
import { useState } from "react";

export default function Interaction() {
  const [messages, setMessages] = useState([
    { id: 1, user: "ali", text: "BTC yükseliyor mu sizce?", likes: 2 },
    { id: 2, user: "ayşe", text: "Ben RSI filtresiyle çok iyi sonuç aldım.", likes: 5 }
  ]);
  const [input, setInput] = useState("");

  function addMessage() {
    if (!input) return;
    const newMsg = {
      id: Date.now(),
      user: "sen",
      text: input,
      likes: 0
    };
    setMessages([newMsg, ...messages]);
    setInput("");
  }

  function likeMessage(id) {
    setMessages(messages.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m));
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Etkileşim</h1>
      <p>Burada kullanıcıların yazdığı mesajları görebilir, beğenebilir ve kendi mesajını yazabilirsin (dummy).</p>

      {/* Mesaj yazma alanı */}
      <div style={{ marginTop: "20px" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Mesajını yaz..."
          style={{ padding: "10px", width: "70%" }}
        />
        <button
          onClick={addMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            background: "#F4B400",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Gönder
        </button>
      </div>

      {/* Mesaj listesi */}
      <div style={{ marginTop: "30px" }}>
        {messages.map(m => (
          <div key={m.id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px", borderRadius: "6px" }}>
            <b>{m.user}</b>: {m.text}
            <div>
              <button
                onClick={() => likeMessage(m.id)}
                style={{ marginTop: "5px", background: "#eee", border: "none", padding: "5px 10px", cursor: "pointer" }}
              >
                👍 {m.likes}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rozet bilgisi */}
      <section style={{ marginTop: "40px" }}>
        <h2>Rozet Durumun</h2>
        <p>Şu anki rozetin: 🥉 Bronz</p>
        <p>Daha fazla etkileşim yaparak rozetini yükseltebilirsin!</p>
      </section>
    </div>
  );
}
