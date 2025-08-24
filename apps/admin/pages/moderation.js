export default function ModerationAdmin() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Etkileşim & Moderasyon (Dummy)</h1>
      <p>Kullanıcıların yazdığı mesajları görebilir, şikâyet edilenleri inceleyebilirsin.</p>
      <ul>
        <li>Mesaj #123 – “BTC düşüyor” – Şikâyet sayısı: 2</li>
        <li>Mesaj #456 – “Pump yapalım mı” – Şikâyet sayısı: 5 🚨</li>
      </ul>
      <button style={{ background: "red", color: "#fff", padding: "8px", border: "none", borderRadius: "6px" }}>
        Seçili Mesajı Sil
      </button>
    </div>
  );
}
