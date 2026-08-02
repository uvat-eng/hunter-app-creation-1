import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initNativeApp, isNativeApp } from './lib/native';
import { restoreFromSnapshotIfEmpty } from './lib/auto-snapshot';

const mount = () => createRoot(document.getElementById("root")!).render(<App />);

// На нативном приложении перед первым рендером проверяем: если основное хранилище
// пустое (например, после обновления версии из RuStore что-то пошло не так с базой),
// автоматически подтягиваем данные из технического снимка — без каких-либо действий пользователя.
if (isNativeApp) {
  restoreFromSnapshotIfEmpty().finally(mount);
} else {
  mount();
}

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