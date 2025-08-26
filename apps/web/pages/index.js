// apps/web/pages/index.js
import Header from "../components/Header";

export default function Home() {
  return (
    <div>
      <Header />

      {/* Hero / Slider */}
      <section id="whatis">
        <div className="bb-container bb-hero-grid">
          <div>
            <div className="eyebrow">Binance ile entegre otomatik al-sat robotu</div>
            <h1>Profesyonel ama <span style={{color:"var(--gold)"}}>basit ve anlaşılır</span> deneyim</h1>
            <p className="lead">Spot & Vadeli için Backtest → Active Test → Robot. Güvenli entegrasyon, şeffaf raporlar ve mobil yönetim.</p>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <a className="btn primary" href="#plans">Hemen Başla</a>
              <a className="btn ghost" href="#features">Özelliklere Bak</a>
            </div>
            <div className="kpis">
              <div className="kpi"><div className="l">Günlük PnL</div><div className="v" style={{color:"var(--green)"}}>+₺1,245</div></div>
              <div className="kpi"><div className="l">Açık Pozisyon</div><div className="v">3</div></div>
              <div className="kpi"><div className="l">Toplam PnL</div><div className="v">₺42,031</div></div>
            </div>
          </div>
          {/* sağda 2 blok */}
          <div>
            <div className="grid-tiles">
              <div className="tile"><h4>ActiveTest</h4><p>Gerçek zaman fiyatla sanal emir ve log takibi.</p></div>
              <div className="tile"><h4>BackTest</h4><p>Komisyon/slippage dâhil simülasyon.</p></div>
              <div className="tile"><h4>Spot Robotu</h4><p className="mini">Plus</p></div>
              <div className="tile"><h4>Vadeli Robotu</h4><p className="mini">Pro</p></div>
              <div className="tile"><h4>Kripto Tarayıcı</h4><p>Hazır şablonlar & özel filtreler</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Güçlü özellikler kesiti */}
      <section id="features">
        <div className="bb-container">
          <div className="eyebrow">Güçlü Özellikler</div>
          <h2>Backtest’ten robota tek akış</h2>
          <div className="features-grid">
            <div className="fcard"><div className="icon">🧪</div><h3>Backtest (Spot & Vadeli)</h3><p>Binance bağlamadan sanal para ile.</p></div>
            <div className="fcard"><div className="icon">⏱️</div><h3>Active Test</h3><p>2sn’de bir kontrol (RSI/SL/TP) seçeneği.</p></div>
            <div className="fcard"><div className="icon">🤖</div><h3>Basit Robot Kurulumu</h3><p>Hazır filtrelerle, sembol bazlı kurallar.</p></div>
            <div className="fcard"><div className="icon">🛡️</div><h3>Detaylı Risk Yönetimi</h3><p>Fixed/Trailing SL & TP, guard seçenekleri.</p></div>
            <div className="fcard"><div className="icon">🔔</div><h3>Alarm & Bildirim</h3><p>E-posta, SMS, Push uyarıları.</p></div>
            <div className="fcard"><div className="icon">📈</div><h3>Raporlama & Grafik</h3><p>PnL, Winrate, Drawdown; CSV export.</p></div>
            <div className="fcard"><div className="icon">🔎</div><h3>Sembol Tarama</h3><p>Şablonlar & özel filtre; spot/vadeli ayrımı.</p></div>
            <div className="fcard"><div className="icon">📱</div><h3>Çoklu Cihaz</h3><p>Web + iOS + Android (yakında).</p></div>
            <div className="fcard"><div className="icon">🔐</div><h3>Ekstra Güvenlik</h3><p>API key şifreleme; çekim yetkisi yok.</p></div>
          </div>
        </div>
      </section>

      {/* Planlar */}
      <section id="plans">
        <div className="bb-container">
          <div className="eyebrow">Üyelikler</div>
          <h2>Ücretsiz, Plus, Pro</h2>
          <div className="pricing">
            <div className="plan">
              <h3>Ücretsiz</h3>
              <div className="price">₺0<span className="per">/ay</span></div>
              <ul>
                <li>Spot & Vadeli Backtest</li>
                <li>Spot & Vadeli Active Test</li>
                <li>Sanal para, API gerekmez</li>
                <li>Temel raporlar</li>
              </ul>
              <a className="btn primary" href="/login">Ücretsiz Dene</a>
            </div>
            <div className="plan highlight">
              <h3>Plus <span className="tag">Önerilen</span></h3>
              <div className="price">₺1500<span className="per">/ay</span></div>
              <ul>
                <li>Spot için filtreli robot</li>
                <li>Sembol tarama</li>
                <li>Geçmiş işlemlere raporlama</li>
                <li>Binance bağlantısı (çekim yok)</li>
              </ul>
              <a className="btn primary" href="/login">Plus’a Geç</a>
            </div>
            <div className="plan">
              <h3>Pro</h3>
              <div className="price">₺2500<span className="per">/ay</span></div>
              <ul>
                <li>Vadeli (kaldıraçlı) robot</li>
                <li>Önerilen kombinasyonlar</li>
                <li>Alarm & otomatik bildirim</li>
                <li>Gelişmiş risk guard</li>
              </ul>
              <a className="btn primary" href="/login">Pro’ya Geç</a>
            </div>
          </div>
          <div style={{textAlign:"center",color:"var(--muted)",marginTop:8,fontSize:13}}>Yıllık ödemede: Plus ₺1000/ay, Pro ₺2000/ay</div>
        </div>
      </section>

      {/* SSS */}
      <section id="faq">
        <div className="bb-container">
          <div className="eyebrow">SSS</div>
          <h2>Sık Sorulanlar</h2>
          <div className="features-grid">
            <div className="fcard"><h3>API anahtarlarım nasıl saklanıyor?</h3><p>KMS + AES-256; sadece işlem yetkisi, çekim yok.</p></div>
            <div className="fcard"><h3>Ücretsiz planda Binance gerekir mi?</h3><p>Gerekmez. Sanal para ile Backtest & Active Test yaparsın.</p></div>
            <div className="fcard"><h3>Sayfadan çıksam robot durur mu?</h3><p>Hayır. Verdiğin parametrelerle arka planda çalışır.</p></div>
            <div className="fcard"><h3>Mobil var mı?</h3><p>Evet, web hazır; iOS/Android M5’te.</p></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bb-footer" id="support">
        <div className="bb-container">
          <div className="f-columns">
            <div>
              <h4>Al-Sat Kripto Robot</h4>
              <a href="#whatis">Nasıl çalışır?</a>
              <a href="#features">Özellikler</a>
              <a href="#plans">Üyelikler</a>
            </div>
            <div>
              <h4>Etkileşim</h4>
              <a href="#">Kampanyalar</a>
              <a href="#">Rozet sistemi</a>
            </div>
            <div>
              <h4>Destek Merkezi</h4>
              <a href="#faq">SSS</a>
              <a href="#">Eğitim videoları</a>
              <a href="#">Talep oluştur</a>
            </div>
            <div>
              <h4>Politikalar & Koşullar</h4>
              <a href="#">Gizlilik Politikası</a>
              <a href="#">Kullanım Şartları</a>
              <a href="#">Çerez Politikası</a>
              <a href="#">Yatırım Uyarıları</a>
              <a href="#">Cayma Hakkı</a>
            </div>
          </div>
          <div className="f-bottom">
            <div>binnbot © {new Date().getFullYear()}</div>
            <div>Youtube • Instagram • X</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
