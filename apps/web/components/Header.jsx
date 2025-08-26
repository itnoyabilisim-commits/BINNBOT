// apps/web/components/Header.jsx
export default function Header() {
  return (
    <header className="bb-header">
      <div className="bb-container bb-header-row">
        <div className="bb-logo">binnbot</div>
        <nav className="bb-nav">
          <a href="#whatis">Al-Sat Kripto Robot</a>
          <a href="#features">Güçlü Özellikler</a>
          <a href="#community">Etkileşim</a>
          <a href="#support">Destek Merkezi</a>
        </nav>
        <div className="bb-cta">
          <a className="btn ghost" href="/login">Panele Git</a>
          <a className="btn primary" href="#plans">Hemen Başla</a>
        </div>
      </div>
      {/* Üst akış şeridi */}
      <div className="bb-ticker">
        <div className="bb-container bb-ticker-row">
          <div className="bb-tick">
            <strong>En çok yükselenler:</strong>
            <span>BTCUSDT +3.4%</span>
            <span>ETHUSDT +2.8%</span>
            <span>BNBUSDT +2.1%</span>
            <span>SOLUSDT +1.9%</span>
            <span>XRPUSDT +1.7%</span>
          </div>
          <div className="bb-tick-split" />
          <div className="bb-tick"><strong>Çalışan robot:</strong> <span>128</span></div>
          <div className="bb-tick-split" />
          <div className="bb-tick"><strong>Aktif kullanıcı:</strong> <span>542</span></div>
        </div>
      </div>
    </header>
  );
}
