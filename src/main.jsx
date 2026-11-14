import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

// Filtrer proprement les avertissements internes de télémétrie Google (GSI)
if (typeof window !== 'undefined') {
  const origWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('[GSI_LOGGER]')) return;
    origWarn.apply(console, args);
  };
  const origError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('[GSI_LOGGER]')) return;
    origError.apply(console, args);
  };
}

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '176049300703-gc9oe1mq2pqoc2ei59042sc0qqnfchlj.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
