export default function NotifierAdmin() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Bildirim & Entegrasyon (Dummy)</h1>
      <p>Burada e-posta, SMS ve push bildirim entegrasyonları yönetilecek.</p>
      <ul>
        <li>Email Provider: Gmail API – Durum: Aktif</li>
        <li>SMS Provider: Twilio – Durum: Pasif</li>
        <li>Push Service: Firebase – Durum: Aktif</li>
      </ul>
      <button style={{ background: "#F4B400", border: "none", padding: "10px 20px", borderRadius: "6px" }}>
        Test Bildirimi Gönder
      </button>
    </div>
  );
}
