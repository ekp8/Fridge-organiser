import 'dotenv/config'; // Load environment variables from .env file

export default {
  expo: {
    name: 'Fridge Organizer',
    slug: 'fridge-organizer',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    // splash: {
    //   image: './assets/splash.png',
    //   resizeMode: 'contain',
    //   backgroundColor: '#ffffff'
    //},
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_EXPIRY_DAYS_WARNING: process.env.EXPO_PUBLIC_EXPIRY_DAYS_WARNING
    } // Environment variables for API URL intro extra and expiry warning days
  }
};