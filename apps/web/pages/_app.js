import '../styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Login gerektirmeyen sayfalar
  const publicPaths = ['/login', '/logout'];

  useEffect(() => {
    // client-side
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isPublic = publicPaths.includes(router.pathname);

    if (!isPublic && !token) {
      // token yok → login'e at
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router.pathname]);

  if (!ready && !publicPaths.includes(router.pathname)) {
    // kısa bekleme (flicker önler)
    return null;
  }

  return (
    <>
      {/* Global header */}
      <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <a href="/dashboard" style={{ marginRight: 15 }}>Dashboard</a>
        <a href="/logout" style={{ color: 'red' }}>Çıkış</a>
      </header>
      <Component {...pageProps} />
    </>
  );
}
