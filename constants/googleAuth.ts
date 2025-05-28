/**
 * Google OAuth Configuration
 * 
 * This file manages Google OAuth client IDs for different environments:
 * - Expo Go (uses Expo's proxy)
 * - Development Build (uses your own client ID)
 * - Production (uses production client ID)
 */

import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export const GOOGLE_CONFIG = {
  // For Expo Go - use your own client IDs (after adding redirect URI to Google Cloud Console)
  EXPO_GO: {
    androidClientId: '223350062068-navgqg2tu1ktidmjehn1svnelrv93lo8.apps.googleusercontent.com',
    iosClientId: '223350062068-navgqg2tu1ktidmjehn1svnelrv93lo8.apps.googleusercontent.com',
    webClientId: '223350062068-gg239dtgv9r56s749kib2vd7leldpoff.apps.googleusercontent.com',
  },
  
  // For Development/Production Build - your actual client IDs
  DEV_BUILD: {
    androidClientId: '223350062068-navgqg2tu1ktidmjehn1svnelrv93lo8.apps.googleusercontent.com',
    iosClientId: '223350062068-navgqg2tu1ktidmjehn1svnelrv93lo8.apps.googleusercontent.com', 
    webClientId: '223350062068-gg239dtgv9r56s749kib2vd7leldpoff.apps.googleusercontent.com',
  }
};

// Get the appropriate config based on environment
export const getGoogleConfig = () => {
  const config = isExpoGo ? GOOGLE_CONFIG.EXPO_GO : GOOGLE_CONFIG.DEV_BUILD;
  
  console.log('🔧 Google Auth Config:', {
    environment: isExpoGo ? 'Expo Go' : 'Development Build',
    androidClientId: config.androidClientId,
    iosClientId: config.iosClientId,
    webClientId: config.webClientId,
  });
  
  return config;
};

// Get the appropriate redirect URI based on environment
export const getRedirectUri = () => {
  if (isExpoGo) {
    // For Expo Go, use the auth.expo.io proxy redirect URI with your actual app slug
    // Format: https://auth.expo.io/@owner/slug
    const redirectUri = 'https://auth.expo.io/@anonymous/expo-app';
    console.log('🔧 Expo Go Redirect URI:', redirectUri);
    return redirectUri;
  } else {
    // For development build, use custom scheme
    const redirectUri = makeRedirectUri({
      scheme: 'expoapp',
      path: 'auth',
    });
    console.log('🔧 Dev Build Redirect URI:', redirectUri);
    return redirectUri;
  }
};

// App scheme for deep linking
export const APP_SCHEME = 'expoapp'; 