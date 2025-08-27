// apps/web/components/Footer.jsx
export default function Footer() {
  const YT = (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M23.5 6.2a4 4 0 0 0-2.8-2.8C18.7 3 12 3 12 3s-6.7 0-8.7.4A4 4 0 0 0 .5 6.2C.1 8.2.1 12 .1 12s0 3.8.4 5.8a4 4 0 0 0 2.8 2.8C5.3 20.9 12 21 12 21s6.7 0 8.7-.4a4 4 0 0 0 2.8-2.8c.4-2 .4-5.8.4-5.8s0-3.8-.4-5.8ZM9.8 15.5v-7l6 3.5-6 3.5Z"/>
    </svg>
  );
  const IG = (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5ZM18 6.8a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"/>
    </svg>
  );
  const X = (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3 3h5.3l4.1 6 4.9-6H21l-7.2 8.8L21 21h-5.3l-4.3-6-5 6H3l7.4-9L3 3Zm4.8 2L19 19h-2.8L5 5h2.8Z"/>
    </svg>
  );

  return (
    <footer className="bb-footer">
      <div className="bb-container f-columns">
        {/* Blok 1 – Menü Tekrarı */}
        <div>
          <h4>Al-Sat Kripto Robot</h4>
          <a href="#whatis">Nasıl Çalışır?</a>
          <a href="#why">Neden Kullanmalıyım?</a>
          <a href="#who">Kimler İçin Uygun?</a>

          <h4 style={{marginTop:12}}>Güçlü Özellikler</h4>
          <a href="#features">Backtest &amp; Active Test</a>
          <a href="#features">Detaylı Risk Yönetimi</a>
          <a href="#features">Alarm &amp; Bildirim</a>
          <a href="#features">Basit Robot Kurulumu</a>
          <a href="#features">Raporlama &amp; Grafikler</a>
          <a href="#features">Sembol Tarama</a>
          <a href="#features">Çoklu Cihaz Yönetimi</a>
          <a href="#features">Ekstra Güvenlik</a>
        </div>

        {/* Blok 2 – Politikalar & Koşullar */}
        <div>
          <h4>Politikalar &amp; Koşullar</h4>
          <a href="#">Gizlilik Politikası</a>
          <a href="#">Kullanım Şartları</a>
          <a href="#">Çerez Politikası</a>
          <a href="#">Yatırım Uyarıları</a>
          <a href="#">Bilgi Toplumu Hizmetleri</a>
          <a href="#">Cayma Hakkı</a>
          <a href="#">KVKK / GDPR</a>
        </div>

        {/* Blok 3 – İletişim & Destek */}
        <div>
          <h4>İletişim &amp; Destek</h4>
          <a href="mailto:destek@binnbot.com">📧 destek@binnbot.com</a>
          <a href="#support">Destek Merkezi</a>
          <a href="#faq">Sık Sorulan Sorular (SSS)</a>

          <h4 style={{marginTop:12}}>Sosyal Medya</h4>
          <div className="socials">
            <a href="#" aria-label="YouTube"><YT/></a>
            <a href="#" aria-label="Instagram"><IG/></a>
            <a href="#" aria-label="X (Twitter)"><X/></a>
          </div>
        </div>

        {/* Blok 5 – Yenilikler */}
        <div>
          <h4>Yenilikler</h4>
          <a href="#changelog">Son Güncellemeler &amp; Patch Notları</a>
          <a href="#changelog">Yeni özellik duyuruları</a>
          <a href="#changelog">Patch &amp; bugfix listeleri</a>
          <a href="#changelog">Versiyon geçmişi</a>
        </div>
      </div>

      {/* Alt Çizgi */}
      <div className="bb-container f-bottom f-bottom-divider">
        <div className="f-inline-badges">
          <span>✅ Binance API Entegrasyonu</span>
          <span>🔒 Verileriniz şifreleniyor</span>
          <span>💳 %100 Güvenli Ödeme</span>
        </div>
        <div>© {new Date().getFullYear()} binnbot – Tüm Hakları Saklıdır</div>
      </div>
    </footer>
  );
}
