import AdMobRewardedComponent from '@/components/AdMobRewarded';
import OfflineBanner from '@/components/ui/OfflineBanner';
import { firebaseConfig } from '@/constants/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as analyticsService from '@/services/analyticsService';
import subscriptionService from '@/services/subscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
// @ts-ignore
import { I18nextProvider } from 'react-i18next';
import mobileAds from 'react-native-google-mobile-ads';
import i18n from './i18n';

// Initialize Firebase only once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default function RootLayout() {
  console.log('[RootLayout] Component Mounting');
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  console.log('[RootLayout] Fonts loaded:', loaded);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const router = useRouter();
  const [isSubscriber, setIsSubscriber] = useState(false);
  const pathname = usePathname();

  // Listen for Firebase Auth state
  useEffect(() => {
    console.log('[RootLayout] Starting app initialization');
    
    // Initialize Google Mobile Ads SDK
    mobileAds()
      .initialize()
      .then((adapterStatuses: any) => {
        console.log('AdMob initialization complete:', adapterStatuses);
      })
      .catch((error: any) => {
        console.warn('AdMob initialization failed:', error);
      });

    const auth = getAuth();
    console.log('[RootLayout] Setting up auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      console.log('[RootLayout] Auth state changed:', user ? 'User logged in' : 'User logged out');
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  // Check onboarding completion from AsyncStorage
  useEffect(() => {
    console.log('[RootLayout] useEffect for Onboarding Check triggered');
    AsyncStorage.getItem('onboardingComplete').then((value) => {
      console.log('[RootLayout] AsyncStorage onboardingComplete value:', value);
      setOnboardingComplete(value === 'true');
    });
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('[RootLayout] useEffect for Routing Logic triggered - isAuthenticated:', isAuthenticated, 'onboardingComplete:', onboardingComplete);
    if (isAuthenticated === null || onboardingComplete === null) {
      console.log('[RootLayout] Routing Logic - Waiting for auth/onboarding status.');
      return;
    }
    if (!isAuthenticated) {
      console.log('[RootLayout] Routing to /auth');
      router.replace('/auth');
    } else if (!onboardingComplete) {
      console.log('[RootLayout] Routing to /onboarding');
      router.replace('/onboarding');
    } else {
      console.log('[RootLayout] User authenticated and onboarding complete.');
    }
    // If both are true, show main tabs
  }, [isAuthenticated, onboardingComplete, router]);

  useEffect(() => {
    console.log('[RootLayout] useEffect for Subscription Status triggered');
    subscriptionService.getCachedSubscriptionStatus().then(setIsSubscriber);
  }, []);

  useEffect(() => {
    console.log('[RootLayout] useEffect for PageView Logging triggered - Pathname:', pathname);
    if (isAuthenticated && onboardingComplete) {
      analyticsService.logPageView(pathname);
    }
  }, [pathname, isAuthenticated, onboardingComplete]);

  if (!loaded || isAuthenticated === null || onboardingComplete === null) {
    console.log('[RootLayout] Rendering null - loaded:', loaded, 'isAuthenticated:', isAuthenticated, 'onboardingComplete:', onboardingComplete);
    // Wait for fonts and auth/onboarding checks
    return null;
  }

  console.log('[RootLayout] Rendering Main App Structure');
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <OfflineBanner />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
        <AdMobRewardedComponent isSubscriber={isSubscriber} />
      </ThemeProvider>
    </I18nextProvider>
  );
}
