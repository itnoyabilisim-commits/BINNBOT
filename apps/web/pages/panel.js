export default function Panel(){
  return (
    <div style={{maxWidth:1000,margin:"40px auto",padding:20}}>
      <h1>👤 Üyelik Paneli</h1>
      <section style={{marginTop:20}}>
        <h2>Profil</h2>
        <p>Telefon: 05xx xxx xx xx</p>
        <p>Doğum Tarihi: 01.01.1990</p>
        <p>Cinsiyet: Erkek</p>
      </section>
      <section style={{marginTop:20}}>
        <h2>Fatura Bilgileri</h2>
        <p>Adres, vergi no vs.</p>
      </section>
      <section style={{marginTop:20}}>
        <h2>Abonelik</h2>
        <p>Plan: Plus (askıya al / iptal butonları)</p>
      </section>
      <section style={{marginTop:20}}>
        <h2>Eğitim Videoları</h2>
        <ul>
          <li>Backtest nedir?</li>
          <li>ActiveTest nasıl?</li>
          <li>Binance hesabı bağlama</li>
        </ul>
      </section>
      <section style={{marginTop:20}}>
        <h2>Rozet & Kampanyalar</h2>
        <p>Paylaş kazan, takip et kazan.</p>
      </section>
    </div>
  )
}
