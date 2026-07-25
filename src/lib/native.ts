import { Capacitor } from '@capacitor/core';

export const isNativeApp = Capacitor.isNativePlatform();

export async function initNativeApp() {
  if (!isNativeApp) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0d1512' });
  } catch {
    /* status bar plugin unavailable on this platform */
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    setTimeout(() => SplashScreen.hide().catch(() => {}), 300);
  } catch {
    /* splash screen plugin unavailable */
  }
}
