import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.DEV ? '/sw.js' : './sw.js';
    navigator.serviceWorker.register(swPath)
      .then((reg) => console.log('SW Registered:', reg.scope))
      .catch((err) => console.error('SW Registration Failed:', err));
  });
}
