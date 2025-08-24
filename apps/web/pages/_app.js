// apps/web/pages/_app.js
import '../styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Login gerektirmeyen sayfalar
  const publicPaths = ['/login', '/logout'];

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isPublic = publicPaths.includes(router.pathname);
    if (!isPublic && !token) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router.pathname]);

  if (!ready && !publicPaths.includes(router.pathname)) {
    return null;
  }

  const isPublic = publicPaths.includes(router.pathname);
  const link = (href, label) => (
    <a
      href={href}
      style={{
        marginRight: 12,
        textDecoration: router.pathname === href ? 'underline' : 'none'
      }}
    >
      {label}
    </a>
  );

  return (
    <>
      {/* Global Header (login sayfasında gizli) */}
      {!isPublic && (
        <header style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {link('/dashboard', 'Dashboard')}
          {link('/tests', 'Testler')}
          {link('/robots', 'Robotlar')}
          {link('/scanner', 'Tarayıcı')}
          {link('/reports', 'Raporlar')}
          {link('/interaction', 'Etkileşim')}
          {link('/support', 'Destek')}
          {link('/account', 'Üyelik')}
          <span style={{ flex: 1 }} />
          <a href="/logout" style={{ color: 'red' }}>Çıkış</a>
        </header>
      )}

      <Component {...pageProps} />
    </>
  );
}
