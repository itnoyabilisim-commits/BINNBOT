// apps/web/components/Header.jsx
import { useEffect, useMemo, useState } from "react";

function useDropdown() {
  const [openKey, setOpenKey] = useState(null);
  const open = (k) => setOpenKey(k);
  const close = () => setOpenKey(null);
  const toggle = (k) => setOpenKey((x) => (x === k ? null : k));
  return { openKey, open, close, toggle };
}

export default function Header() {
  // === Ticker (dummy) ===
  const gainers = useMemo(
    () => [
      { s: "BTCUSDT", p: "+3.42%" },
      { s: "ETHUSDT", p: "+2.87%" },
      { s: "SOLUSDT", p: "+2.44%" },
      { s: "AVAXUSDT", p: "+1.96%" },
      { s: "XRPUSDT", p: "+1.75%" },
    ],
    []
  );
  const [activeRobots] = useState(257);
  const [activeUsers] = useState(1420);

  // === Dil & Tema ===
  const [lang, setLang] = useState("TR");
  const [light, setLight] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (light) root.classList.add("light");
    else root.classList.remove("light");
  }, [light]);

  // Dropdown state
  const dd = useDropdown();

  // Wordmark + candlestick-O
  const Logo = () => (
    <div className="bb-logo" aria-label="binnbot">
      <span>binnb</span>
      <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden className="bb-logo-o">
        <circle cx="32" cy="32" r="28" fill="var(--gold)" />
        <line x1="32" y1="16" x2="32" y2="48" stroke="#0B0F17" strokeWidth="6" strokeLinecap="round" />
        <rect x="24" y="24" width="16" height="16" rx="4" fill="#0B0F17" />
      </svg>
      <span>t</span>
    </div>
  );

  // Dropdown item helpers (ikon + text)
  const A = ({ href = "#", icon = "•", label, sub }) => (
    <a href={href} className="drop-item">
      <span className="drop-ico">{icon}</span>
      <span className="drop-txt">
        {label}
        {sub && <span className="mini">{sub}</span>}
      </span>
    </a>
  );

  return (
    <header className="bb-header">
      {/* Üst Bilgi Barı (Ticker) */}
      <div className="bb-ticker" role="region" aria-label="Günün özet akışı">
        <div className="bb-container bb-ticker-row">
          {/* Track #1 */}
          <div className="bb-tick">
            <strong>📈 En çok yükselenler:</strong>
            {gainers.map((g, i) => (
              <span key={`g1-${i}`}>{g.s} {g.p}</span>
            ))}
            <span className="bb-tick-split" />
            <strong>🤖 Aktif robot:</strong> <span>{activeRobots}</span>
            <span className="bb-tick-split" />
            <strong>👤 Aktif kullanıcı:</strong> <span>{activeUsers}</span>
          </div>
          {/* Track #2 (aynı içerik, seamless) */}
          <div className="bb-tick" aria-hidden="true">
            <strong>📈 En çok yükselenler:</strong>
            {gainers.map((g, i) => (
              <span key={`g2-${i}`}>{g.s} {g.p}</span>
            ))}
            <span className="bb-tick-split" />
            <strong>🤖 Aktif robot:</strong> <span>{activeRobots}</span>
            <span className="bb-tick-split" />
            <strong>👤 Aktif kullanıcı:</strong> <span>{activeUsers}</span>
          </div>
        </div>
      </div>

      {/* Header Ana Kısım */}
      <div className="bb-container bb-header-row">
        <Logo />

        {/* Ana Menü + Dropdown’lar (kontrollü) */}
        <nav className="bb-nav" aria-label="Ana menü">
          {/* 1. Al-Sat Kripto Robot */}
          <div
            className={`dropdown ${dd.openKey === "robot" ? "open" : ""}`}
            onMouseEnter={() => dd.open("robot")}
            onMouseLeave={dd.close}
            onFocus={() => dd.open("robot")}
            onBlur={dd.close}
          >
            <button
              className="drop-trigger"
              aria-haspopup="true"
              aria-expanded={dd.openKey === "robot"}
              onClick={() => dd.toggle("robot")}
            >
              Al-Sat Kripto Robot
            </button>
            <div className="dropdown-menu">
              <A href="#whatis" icon="🧭" label="Nasıl Çalışır?" sub="Backtest → Active Test → Robot" />
              <A href="#why" icon="💡" label="Neden Kullanmalıyım?" />
              <A href="#who" icon="🎯" label="Kimler İçin Uygun?" />
            </div>
          </div>

          {/* 2. Güçlü Özellikler */}
          <div
            className={`dropdown ${dd.openKey === "features" ? "open" : ""}`}
            onMouseEnter={() => dd.open("features")}
            onMouseLeave={dd.close}
            onFocus={() => dd.open("features")}
            onBlur={dd.close}
          >
            <button
              className="drop-trigger"
              aria-haspopup="true"
              aria-expanded={dd.openKey === "features"}
              onClick={() => dd.toggle("features")}
            >
              Güçlü Özellikler
            </button>
            <div className="dropdown-menu columns-2">
              <A href="#features" icon="🧪" label="Backtest & Active Test" />
              <A href="#features" icon="🛡️" label="Detaylı Risk Yönetimi" />
              <A href="#features" icon="🔔" label="Alarm & Bildirim" />
              <A href="#features" icon="🤖" label="Basit Robot Kurulumu" />
              <A href="#features" icon="📈" label="Raporlama & Grafik" />
              <A href="#features" icon="🔎" label="Sembol Tarama" />
              <A href="#features" icon="📱" label="Çoklu Cihaz" />
              <A href="#features" icon="🔐" label="Ekstra Güvenlik" />
            </div>
          </div>

          {/* 3. Etkileşim */}
          <div
            className={`dropdown ${dd.openKey === "community" ? "open" : ""}`}
            onMouseEnter={() => dd.open("community")}
            onMouseLeave={dd.close}
            onFocus={() => dd.open("community")}
            onBlur={dd.close}
          >
            <button
              className="drop-trigger"
              aria-haspopup="true"
              aria-expanded={dd.openKey === "community"}
              onClick={() => dd.toggle("community")}
            >
              Etkileşim
            </button>
            <div className="dropdown-menu">
              <A href="#community" icon="🎁" label="Kampanyalar" />
              <A href="#community" icon="🏅" label="Rozet Sistemi" />
              <A href="#community" icon="💬" label="İletişim Akışı" />
            </div>
          </div>

          {/* 4. Destek Merkezi */}
          <div
            className={`dropdown ${dd.openKey === "support" ? "open" : ""}`}
            onMouseEnter={() => dd.open("support")}
            onMouseLeave={dd.close}
            onFocus={() => dd.open("support")}
            onBlur={dd.close}
          >
            <button
              className="drop-trigger"
              aria-haspopup="true"
              aria-expanded={dd.openKey === "support"}
              onClick={() => dd.toggle("support")}
            >
              Destek Merkezi
            </button>
            <div className="dropdown-menu">
              <A href="#support" icon="🎓" label="Eğitim Videoları" />
              <A href="#faq" icon="❓" label="SSS" />
              <A href="#docs" icon="📚" label="Dokümanlar" />
              <A href="#support" icon="📝" label="Talep Oluştur" />
            </div>
          </div>
        </nav>

        {/* Sağ Kısım: Dil / Tema / CTA’lar */}
        <div className="bb-cta">
          <div className="switchers">
            <select
              aria-label="Dil seç"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="switch"
              title="Dil"
            >
              <option>TR</option>
              <option>EN</option>
            </select>
            <button
              aria-label="Tema değiştir"
              className="switch"
              onClick={() => setLight((v) => !v)}
              title="Tema"
            >
              {light ? "🌙" : "☀️"}
            </button>
          </div>

          <a className="btn ghost" href="/login">Panele Git</a>

          {/* CTA içinde sublabel ("Ücretsiz") */}
          <a className="btn primary btn-with-sub" href="#plans" aria-label="Hemen Başla (Ücretsiz)">
            <span className="btn-main">Hemen Başla</span>
            <span className="btn-sub">Ücretsiz</span>
          </a>
        </div>
      </div>

      {/* Opsiyonel badge bar (simetrik) */}
<div className="bb-container bb-badges-row">
  <div className="badge-card">
    <div className="ico">✅</div>
    <div className="txt">
      <div className="title">Binance API</div>
      <div className="sub">Entegrasyonu aktif</div>
    </div>
  </div>
  <div className="badge-card">
    <div className="ico">🟢</div>
    <div className="txt">
      <div className="title">Sistem</div>
      <div className="sub">Çalışıyor</div>
    </div>
  </div>
  <div className="badge-card">
    <div className="ico">🔒</div>
    <div className="txt">
      <div className="title">Verileriniz</div>
      <div className="sub">Şifreleniyor</div>
    </div>
  </div>
</div>
    </header>
  );
}
