export default function RobotsAdmin() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Robot Monitörü (Dummy)</h1>
      <p>Burada çalışan robotlar listelenecek ve acil stop yapılabilecek.</p>
      <ul>
        <li>Robot #1 – BTC Spot – Aktif</li>
        <li>Robot #2 – ETH Vadeli – Aktif</li>
      </ul>
      <button style={{ background: "red", color: "#fff", padding: "10px", border: "none", borderRadius: "6px" }}>
        🚨 Acil Stop
      </button>
    </div>
  );
}
