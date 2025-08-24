import '../styles.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <header style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <a href="/dashboard" style={{ marginRight: "15px" }}>Dashboard</a>
        <a href="/logout" style={{ color: "red" }}>Çıkış</a>
      </header>
      <Component {...pageProps} />
    </>
  );
}
