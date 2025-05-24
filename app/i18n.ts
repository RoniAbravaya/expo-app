// i18n.ts
// Initializes i18next with react-i18next and expo-localization for multi-language support in Expo/React Native.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '../locales/ar.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import hi from '../locales/hi.json';
import zh from '../locales/zh.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  hi: { translation: hi },
  es: { translation: es },
  ar: { translation: ar },
};

// Get device locale safely
const getDeviceLocale = () => {
  try {
    const locale = Localization.getLocales?.()?.[0]?.languageCode || 
                   Localization.locale?.split('-')?.[0] || 
                   'en';
    return locale;
  } catch (error) {
    console.warn('Failed to get device locale:', error);
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLocale(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
    // Add debug mode for development
    debug: __DEV__,
  });

const LANGUAGE_KEY = 'user_language';

async function loadLanguage() {
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLang && savedLang !== i18n.language) {
      await i18n.changeLanguage(savedLang);
    }
  } catch (e) {
    console.warn('Failed to load saved language:', e);
    // fallback to default
  }
}

export async function setLanguage(lang: string) {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (e) {
    console.warn('Failed to set language:', e);
  }
}

// Call loadLanguage on startup
loadLanguage();

export default i18n; 