export default function AuditAdmin() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Audit & Güvenlik (Dummy)</h1>
      <p>Kullanıcı işlemleri ve kritik loglar burada tutulacak.</p>
      <ul>
        <li>[2025-08-24 12:00] mehmet@example.com – Yeni robot kurdu</li>
        <li>[2025-08-24 12:10] admin – Acil stop tetiklendi</li>
        <li>[2025-08-24 12:15] ayse@example.com – Hesap silme talebi gönderdi</li>
      </ul>
      <p>📌 Audit loglar WORM formatında, hash zinciri ile korunuyor (dummy).</p>
    </div>
  );
}
