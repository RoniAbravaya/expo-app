import { firebaseConfig } from '@/constants/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';

// Initialize Firebase only once
console.log('[Firebase] Attempting to initialize Firebase...');
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;

if (!getApps().length) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('[Firebase] Successfully initialized Firebase app:', firebaseApp.name);
    
    // Initialize Auth
    auth = getAuth(firebaseApp);
    console.log('[Firebase] Auth initialized');
  } catch (error) {
    console.error('[Firebase] Failed to initialize Firebase:', error);
  }
} else {
  firebaseApp = getApps()[0];
  auth = getAuth(firebaseApp);
  console.log('[Firebase] Firebase already initialized');
}

export default function RootLayout() {
  console.log('[RootLayout] Component Mounting');
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const router = useRouter();

  // Initialize app with timeout fallback
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[RootLayout] Starting app initialization...');
        
        // Check onboarding status
        const onboardingStatus = await AsyncStorage.getItem('onboardingComplete');
        console.log('[RootLayout] Onboarding status:', onboardingStatus);
        setOnboardingComplete(onboardingStatus === 'true');
        
        // Set up Firebase Auth listener with timeout - only if Firebase is initialized
        const setupAuth = () => {
          return new Promise<void>((resolve) => {
            try {
              if (!firebaseApp || !auth) {
                console.error('[RootLayout] Firebase app or auth not initialized');
                setIsAuthenticated(false);
                resolve();
                return;
              }

              console.log('[RootLayout] Setting up auth listener with Firebase app');
              
              const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
                console.log('[RootLayout] Auth state changed:', user ? 'User logged in' : 'User logged out');
                setIsAuthenticated(!!user);
                resolve();
              });
              
              // Cleanup function
              return unsubscribe;
            } catch (error) {
              console.error('[RootLayout] Auth setup error:', error);
              setIsAuthenticated(false);
              resolve();
            }
          });
        };
        
        // Set up auth with 3-second timeout
        const authPromise = setupAuth();
        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log('[RootLayout] Auth setup timeout - defaulting to unauthenticated');
            if (isAuthenticated === null) {
              setIsAuthenticated(false);
            }
            resolve();
          }, 3000);
        });
        
        await Promise.race([authPromise, timeoutPromise]);
        
        console.log('[RootLayout] App initialization complete');
        setIsLoading(false);
      } catch (error) {
        console.error('[RootLayout] Error during initialization:', error);
        // Set defaults to prevent infinite loading
        setIsAuthenticated(false);
        setOnboardingComplete(false);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle navigation
  useEffect(() => {
    if (isLoading || isAuthenticated === null || onboardingComplete === null) {
      console.log('[RootLayout] Still loading...');
      return;
    }

    console.log('[RootLayout] Navigation logic - auth:', isAuthenticated, 'onboarding:', onboardingComplete);
    
    if (!isAuthenticated) {
      console.log('[RootLayout] Navigating to auth');
      router.replace('/auth');
    } else if (!onboardingComplete) {
      console.log('[RootLayout] Navigating to onboarding');
      router.replace('/onboarding');
    }
  }, [isAuthenticated, onboardingComplete, isLoading, router]);

  // Show loading screen while initializing
  if (isLoading) {
    console.log('[RootLayout] Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#6b7280' }}>Initializing app...</Text>
      </View>
    );
  }

  console.log('[RootLayout] Rendering main app structure');
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
