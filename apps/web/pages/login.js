// apps/web/pages/login.js
export default function Login(){
  async function handleLogin(e){
    e.preventDefault();
    const email = e.target.email.value || "superadmin@binnbot.com";
    const password = e.target.password.value || "123456";
    const r = await fetch("http://localhost:8080/auth/login",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    });
    const j = await r.json();
    if(r.ok && j.accessToken){
      localStorage.setItem("accessToken", j.accessToken);
      localStorage.setItem("refreshToken", j.refreshToken);
      window.location.href = "/dashboard"; // login sonrası içeri
    }else{
      alert("Giriş başarısız");
    }
  }
  return (
    <div style={{maxWidth:420, margin:"80px auto", padding:20, border:"1px solid #1F2937", borderRadius:12}}>
      <h2>Panele Giriş</h2>
      <form onSubmit={handleLogin}>
        <label>E-posta</label>
        <input name="email" defaultValue="superadmin@binnbot.com" style={{width:"100%",padding:10,margin:"6px 0 12px",borderRadius:8,border:"1px solid #1F2937"}}/>
        <label>Şifre</label>
        <input type="password" name="password" defaultValue="123456" style={{width:"100%",padding:10,margin:"6px 0 16px",borderRadius:8,border:"1px solid #1F2937"}}/>
        <button className="btn primary" type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}
