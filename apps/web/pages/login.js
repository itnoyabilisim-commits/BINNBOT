// apps/web/pages/login.js
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("user@binnbot.com");
  const [password, setPassword] = useState("123456");
  const [msg, setMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("Giriş yapılıyor...");
    try {
      const r = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!r.ok) throw new Error("Login başarısız");
      const data = await r.json();
      // tokenları sakla
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setMsg("Giriş başarılı. Yönlendiriliyor...");
      // dashboard'a git (Next.js olmadan basit yönlendirme)
      window.location.href = "/dashboard";
    } catch (e) {
      setMsg("Hata: " + e.message);
    }
  }

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif", maxWidth: 400 }}>
      <h1>Giriş Yap</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 10 }}>
          <label>E-posta</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={email} onChange={e => setEmail(e.target.value)}
            type="email" required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Şifre</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={password} onChange={e => setPassword(e.target.value)}
            type="password" required
          />
        </div>
        <button
          type="submit"
          style={{ background: "#F4B400", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer" }}
        >
          Giriş
        </button>
      </form>
      <p style={{ marginTop: 10 }}>{msg}</p>
      <p style={{ marginTop: 20, color: "#666" }}>
        (Şimdilik dummy; gateway {`/auth/login`} çağrılır, tokenlar localStorage'a yazılır.)
      </p>
    </div>
  );
}
