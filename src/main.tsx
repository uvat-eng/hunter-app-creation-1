import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initNativeApp, isNativeApp } from './lib/native';

createRoot(document.getElementById("root")!).render(<App />);

initNativeApp();

if ('serviceWorker' in navigator && import.meta.env.PROD && !isNativeApp) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update().catch(() => {});
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            window.location.reload();
          }
        });
      });
    }).catch(() => {});
  });
}