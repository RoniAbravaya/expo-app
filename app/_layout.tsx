import AdMobRewardedComponent from '@/components/AdMobRewarded'; // Re-enabled for Expo Go compatibility
import OfflineBanner from '@/components/ui/OfflineBanner';
import { firebaseConfig } from '@/constants/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as analyticsService from '@/services/analyticsService';
import subscriptionService from '@/services/subscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
// @ts-ignore
import { I18nextProvider } from 'react-i18next';
// import mobileAds from 'react-native-google-mobile-ads'; // Disabled for Expo Go
import i18n from './i18n';

// Initialize Firebase only once
console.log('[Firebase] Attempting to initialize Firebase...');
console.log('[Firebase] Config:', firebaseConfig);

if (!getApps().length) {
  try {
    const app = initializeApp(firebaseConfig);
    console.log('[Firebase] Successfully initialized Firebase app:', app.name);
  } catch (error) {
    console.error('[Firebase] Failed to initialize Firebase:', error);
  }
} else {
  console.log('[Firebase] Firebase already initialized');
}

export default function RootLayout() {
  console.log('[RootLayout] Component Mounting');
  const colorScheme = useColorScheme();
  
  // Remove font loading for now to unblock the app
  // const [loaded, fontError] = useFonts({
  //   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  // });
  // console.log('[RootLayout] Fonts loaded:', loaded, 'Font error:', fontError);
  console.log('[RootLayout] Skipping font loading for now');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const router = useRouter();
  const [isSubscriber, setIsSubscriber] = useState(false);
  const pathname = usePathname();

  // Initialize Firebase and wait for it to be ready
  useEffect(() => {
    console.log('[RootLayout] Checking Firebase initialization...');
    
    // Longer delay to ensure Firebase Auth is fully ready
    const timer = setTimeout(() => {
      if (getApps().length > 0) {
        console.log('[RootLayout] Firebase is ready');
        setFirebaseReady(true);
      } else {
        console.warn('[RootLayout] Firebase not initialized yet');
        // Retry once more after another delay
        setTimeout(() => {
          if (getApps().length > 0) {
            console.log('[RootLayout] Firebase is ready (retry)');
            setFirebaseReady(true);
          } else {
            console.error('[RootLayout] Firebase failed to initialize after retries');
          }
        }, 500);
      }
    }, 500); // Increased from 100ms to 500ms
    
    return () => clearTimeout(timer);
  }, []);

  // Listen for Firebase Auth state ONLY after Firebase is ready
  useEffect(() => {
    if (!firebaseReady) {
      console.log('[RootLayout] Waiting for Firebase to be ready...');
      return;
    }

    console.log('[RootLayout] Starting app initialization');
    
    // Initialize Firebase Analytics
    analyticsService.initializeAnalytics().catch((error: any) => {
      console.warn('Analytics initialization failed:', error);
    });
    
    // Initialize Google Mobile Ads SDK - Disabled for Expo Go
    /*
    mobileAds()
      .initialize()
      .then((adapterStatuses: any) => {
        console.log('AdMob initialization complete:', adapterStatuses);
      })
      .catch((error: any) => {
        console.warn('AdMob initialization failed:', error);
      });
    */

    const setupAuth = async () => {
      try {
        // Wait a bit more for Auth to be ready
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const auth = getAuth();
        console.log('[RootLayout] Setting up auth listener');
        
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
          console.log('[RootLayout] Auth state changed:', user ? 'User logged in' : 'User logged out');
          setIsAuthenticated(!!user);
        });

        return unsubscribe;
      } catch (error) {
        console.error('[RootLayout] Error setting up auth listener:', error);
        
        // Retry auth setup after a delay
        const retryTimer = setTimeout(async () => {
          try {
            console.log('[RootLayout] Retrying auth listener setup...');
            const auth = getAuth();
            const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
              console.log('[RootLayout] Auth state changed (retry):', user ? 'User logged in' : 'User logged out');
              setIsAuthenticated(!!user);
            });
            return unsubscribe;
          } catch (retryError) {
            console.error('[RootLayout] Auth retry failed:', retryError);
            // Set authenticated to false so app can continue
            setIsAuthenticated(false);
          }
        }, 1000);
        
        return () => clearTimeout(retryTimer);
      }
    };

    setupAuth();
  }, [firebaseReady]);

  // Check onboarding completion from AsyncStorage
  useEffect(() => {
    if (!firebaseReady) {
      console.log('[RootLayout] Waiting for Firebase before checking onboarding...');
      return;
    }
    
    console.log('[RootLayout] useEffect for Onboarding Check triggered');
    AsyncStorage.getItem('onboardingComplete').then((value) => {
      console.log('[RootLayout] AsyncStorage onboardingComplete value:', value);
      setOnboardingComplete(value === 'true');
    });
  }, [firebaseReady, isAuthenticated]);

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
    if (!firebaseReady) {
      console.log('[RootLayout] Waiting for Firebase before checking subscription...');
      return;
    }
    
    console.log('[RootLayout] useEffect for Subscription Status triggered');
    subscriptionService.getCachedSubscriptionStatus().then(setIsSubscriber);
  }, [firebaseReady]);

  useEffect(() => {
    console.log('[RootLayout] useEffect for PageView Logging triggered - Pathname:', pathname);
    if (firebaseReady && isAuthenticated && onboardingComplete) {
      analyticsService.logPageView(pathname);
    }
  }, [pathname, isAuthenticated, onboardingComplete, firebaseReady]);

  // Add a timeout fallback to prevent infinite waiting
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isAuthenticated === null) {
        console.log('[RootLayout] Fallback: Setting authenticated to false after timeout');
        setIsAuthenticated(false);
      }
      if (onboardingComplete === null) {
        console.log('[RootLayout] Fallback: Setting onboardingComplete to false after timeout');
        setOnboardingComplete(false);
      }
    }, 5000); // 5 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [isAuthenticated, onboardingComplete]);

  if (!firebaseReady || isAuthenticated === null || onboardingComplete === null) {
    console.log('[RootLayout] Rendering null - waiting for Firebase/auth/onboarding status - firebaseReady:', firebaseReady, 'isAuthenticated:', isAuthenticated, 'onboardingComplete:', onboardingComplete);
    // Wait for Firebase, auth, and onboarding checks
    return null;
  }

  // Don't block app loading if fonts fail - just log it
  // if (!loaded) {
  //   console.log('[RootLayout] Fonts not loaded yet, but continuing anyway');
  // }

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
