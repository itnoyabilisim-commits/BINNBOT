// apps/web/components/RobotHeroPro.jsx
// Amaç: 1) Otomatik al-sat  2) Alttan AL / üstten SAT  3) 24/7  4) Stop-loss
export default function RobotHeroPro() {
  return (
    <div className="rhpro">
      {/* 24/7 halka */}
      <div className="rhpro-ring" aria-hidden><span/></div>

      {/* Robot görseli (senin robot.png) */}
      <img className="rhpro-robot" src="/robot.png" alt="binnbot robot" />

      {/* AL / SAT butonları */}
      <div className="rhpro-pill buy">AL</div>
      <div className="rhpro-pill sell">SAT</div>

      {/* Kâr etiketi */}
      <div className="rhpro-profit">+%4.2 · +₺1.520</div>

      {/* STOP / risk guard */}
      <div className="rhpro-shield" title="Stop-loss aktif">🛡️ STOP</div>

      {/* Mum grafik (yukarı doğru genel trend + küçük oynamalar) */}
      <svg className="rhpro-candles" viewBox="0 0 560 160" aria-hidden>
        {/* zemin çizgileri */}
        <g opacity="0.15" stroke="#ffffff22">
          {[0,1,2,3,4,5,6,7,8].map(i=><line key={i} x1={30+i*60} y1="10" x2={30+i*60} y2="150" />)}
          {[0,1,2].map(i=><line key={"h"+i} x1="30" y1={150-i*45} x2="530" y2={150-i*45} />)}
        </g>

        {/* canlanan mumlar */}
        {[
          {x:60,  h:30, c:"#10B981"},{x:100, h:18, c:"#e53935"},{x:140, h:26, c:"#10B981"},
          {x:180, h:22, c:"#e53935"},{x:220, h:34, c:"#10B981"},{x:260, h:28, c:"#e53935"},
          {x:300, h:40, c:"#10B981"},{x:340, h:44, c:"#10B981"},{x:380, h:24, c:"#e53935"},
          {x:420, h:48, c:"#10B981"},{x:460, h:54, c:"#10B981"}
        ].map((m,i)=>(
          <g key={i} transform={`translate(${m.x},0)`}>
            <rect x="8" y="20" width="2" height="120" rx="1" fill="#ffffff22"/>
            <rect className="rhpro-body" x="2" y={140-m.h} width="12" height={m.h} rx="2" fill={m.c}>
              <animate attributeName="height" from={m.h*0.5} to={m.h} dur="0.9s" begin={`${0.12*i}s`} fill="freeze"/>
              <animate attributeName="y" from={140-m.h*0.5} to={140-m.h} dur="0.9s" begin={`${0.12*i}s`} fill="freeze"/>
            </rect>
          </g>
        ))}

        {/* Fiyat izleyici noktası */}
        <circle r="4" fill="var(--gold)">
          <animateMotion dur="5s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1">
            <mpath xlinkHref="#rhpro-path" />
          </animateMotion>
        </circle>

        {/* Trend path (gizli) */}
        <path id="rhpro-path" d="M40,130 C120,120 180,110 240,100 C300,90 370,70 460,60" fill="none" stroke="none"/>
      </svg>
    </div>
  );
}
