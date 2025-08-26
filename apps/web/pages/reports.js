export default function Reports(){
  const reports=[
    {date:"2025-08-01",pnl:1200,winrate:"62%",maxDD:"18%"},
    {date:"2025-08-02",pnl:-340,winrate:"58%",maxDD:"20%"}
  ];
  return (
    <div style={{maxWidth:1000,margin:"40px auto",padding:20}}>
      <h1>📈 Raporlar</h1>
      <table border="1" cellPadding="8" style={{borderCollapse:"collapse",width:"100%"}}>
        <thead><tr><th>Tarih</th><th>PnL</th><th>Winrate</th><th>MaxDD</th></tr></thead>
        <tbody>
          {reports.map((r,i)=>(
            <tr key={i}>
              <td>{r.date}</td>
              <td style={{color:r.pnl>=0?"green":"red"}}>{r.pnl}</td>
              <td>{r.winrate}</td>
              <td>{r.maxDD}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
