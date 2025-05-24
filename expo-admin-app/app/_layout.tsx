// _layout.tsx for Expo Admin App
// Sets up Firebase, theme, and navigation for the admin dashboard

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { firebaseConfig } from '../constants/firebaseConfig';

// Initialize Firebase only once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Admin context
const AdminContext = createContext<{ isAdmin: boolean; user: User | null }>({ isAdmin: false, user: null });
export function useAdmin() { return useContext(AdminContext); }

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setChecking(false);
        if (pathname !== '/login') router.replace('/login');
        return;
      }
      // Check admin role
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', u.uid));
      const isAdminUser = userDoc.exists() && userDoc.data().role === 'admin';
      setIsAdmin(isAdminUser);
      setChecking(false);
      if (!isAdminUser && pathname !== '/login') router.replace('/login');
      if (isAdminUser && pathname === '/login') router.replace('/');
    });
    return unsubscribe;
  }, [pathname, router]);

  if (!loaded || checking) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AdminContext.Provider value={{ isAdmin, user }}>
      <PaperProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </AdminContext.Provider>
  );
}
