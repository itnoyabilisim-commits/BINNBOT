export default function SystemAdmin() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Sistem Durumu (Dummy)</h1>
      <p>Tüm servislerin sağlık durumunu görebilirsin.</p>
      <ul>
        <li>API Gateway – ✅ Çalışıyor</li>
        <li>Scanner – ✅ Çalışıyor</li>
        <li>Reporting – ⚠️ Yavaş yanıt</li>
        <li>Scheduler – ✅ Çalışıyor</li>
        <li>Notifier – ❌ Hata (SMS provider)</li>
      </ul>
    </div>
  );
}
