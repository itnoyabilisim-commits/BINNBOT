// apps/web/pages/account.js
import { useState } from "react";

export default function Account() {
  const [profile, setProfile] = useState({
    name: "Mehmet Yılmaz",
    email: "mehmet@example.com",
    phone: "+90 555 111 22 33",
    birthdate: "1990-01-01",
    gender: "Erkek"
  });

  const [plan] = useState({
    type: "Plus",
    price: "₺1500 / ay",
    renewal: "2025-09-01"
  });

  const [security] = useState({
    twofa: true,
    apiKeys: 1
  });

  const [badges] = useState([
    { name: "Bronz", icon: "🥉", earned: true },
    { name: "Gümüş", icon: "🥈", earned: false },
    { name: "Altın", icon: "🥇", earned: false }
  ]);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Üyelik Paneli</h1>

      {/* Profil Bilgileri */}
      <section style={{ marginTop: "20px" }}>
        <h2>Profil Bilgileri</h2>
        <p><b>Ad Soyad:</b> {profile.name}</p>
        <p><b>E-posta:</b> {profile.email}</p>
        <p><b>Telefon:</b> {profile.phone}</p>
        <p><b>Doğum Tarihi:</b> {profile.birthdate}</p>
        <p><b>Cinsiyet:</b> {profile.gender}</p>
      </section>

      {/* Plan ve Ödeme */}
      <section style={{ marginTop: "40px" }}>
        <h2>Plan & Ödeme</h2>
        <p><b>Plan Türü:</b> {plan.type}</p>
        <p><b>Ücret:</b> {plan.price}</p>
        <p><b>Yenilenme Tarihi:</b> {plan.renewal}</p>
      </section>

      {/* Güvenlik */}
      <section style={{ marginTop: "40px" }}>
        <h2>Güvenlik</h2>
        <p><b>2FA:</b> {security.twofa ? "Aktif" : "Pasif"}</p>
        <p><b>Kayıtlı API Key:</b> {security.apiKeys}</p>
      </section>

      {/* Sözleşmeler */}
      <section style={{ marginTop: "40px" }}>
        <h2>Sözleşmeler</h2>
        <ul>
          <li>✔ Gizlilik Politikası</li>
          <li>✔ Kullanım Şartları</li>
          <li>✔ Çerez Politikası</li>
          <li>✔ KVKK / GDPR</li>
        </ul>
      </section>

      {/* Rozetler */}
      <section style={{ marginTop: "40px" }}>
        <h2>Rozetlerim</h2>
        <ul>
          {badges.map((b, i) => (
            <li key={i}>
              {b.icon} {b.name} {b.earned ? "(Alındı)" : "(Kilidi Açılmadı)"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
