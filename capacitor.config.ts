import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.hunterdiary.app',
  appName: 'Охотник',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0d1512',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
