// apps/web/components/RobotHeroVisual.jsx
// Sağ tarafa yerleşecek animasyonlu robot görseli (AL/SAT + 24h + mumlar)
// Not: robot görselini /public/ altına ekle (örn: /public/robot-hero.png)
export default function RobotHeroVisual() {
  return (
    <div className="robot-hero">
      {/* köşe: binnbot wordmark */}
      <div className="rh-brand">
        <span className="b">binnb</span>
        <svg width="14" height="14" viewBox="0 0 64 64" aria-hidden className="o">
          <circle cx="32" cy="32" r="28" fill="var(--gold)" />
          <line x1="32" y1="16" x2="32" y2="48" stroke="#0B0F17" strokeWidth="6" strokeLinecap="round" />
          <rect x="24" y="24" width="16" height="16" rx="4" fill="#0B0F17" />
        </svg>
        <span className="t">t</span>
      </div>

      {/* robot illüstrasyonu (senin seçtiğin 2D mockup) */}
      <img className="rh-robot" src="/robot-hero.png" alt="binnbot robot" />

      {/* 24 saat kontrol – dönen halka */}
      <div className="rh-watch" aria-hidden>
        <div className="ring"></div>
        <div className="dot"></div>
      </div>

      {/* AL / SAT etiketleri */}
      <div className="rh-tag buy">AL</div>
      <div className="rh-tag sell">SAT</div>

      {/* canlandırılmış mum grafiği */}
      <svg className="rh-candles" viewBox="0 0 220 120" aria-hidden>
        {/* 8 adet mum: yükseklik/konum animasyonlu */}
        {[0,1,2,3,4,5,6,7].map((i)=>(
          <g key={i} transform={`translate(${20 + i*24},0)`} className={`c c${i}`}>
            {/* fitil */}
            <rect x="8" y="15" width="2" height="90" rx="1" fill="#ffffff22"/>
            {/* gövde */}
            <rect className="body" x="3" y="60" width="12" height="40" rx="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}
