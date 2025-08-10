import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Auto-ping on app load
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.pingServer) {
        window.pingServer();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return <Component {...pageProps} />
}