// analyticsService.ts
// Utility for logging analytics events using Firebase Analytics
// Make sure Firebase Analytics is enabled in the Firebase Console

import { logEvent as firebaseLogEvent, getAnalytics, isSupported } from 'firebase/analytics';
import { getApp, getApps } from 'firebase/app';

let analytics: any = null;
let analyticsSupported = false;

// Initialize analytics (call this once when the app starts)
export async function initializeAnalytics() {
  try {
    // Check if Firebase is initialized first
    if (!getApps().length) {
      console.log('Firebase not initialized yet, skipping analytics initialization');
      return;
    }
    
    const supported = await isSupported();
    if (supported) {
      const app = getApp();
      analytics = getAnalytics(app);
      analyticsSupported = true;
      console.log('Firebase Analytics initialized');
    } else {
      console.log('Firebase Analytics not supported in this environment');
    }
  } catch (e) {
    console.warn('Failed to initialize Firebase Analytics:', e);
    // Don't throw error - just log it and continue
  }
}

export async function logEvent(name: string, params?: Record<string, any>) {
  try {
    if (analyticsSupported && analytics) {
      await firebaseLogEvent(analytics, name, params);
    } else {
      // Fallback for development or unsupported environments
      console.log('Analytics Event:', name, params);
    }
  } catch (e) {
    console.warn('Analytics error:', e);
  }
}

export async function logLogin(method: string) {
  await logEvent('login', { method });
}

export async function logPageView(page: string) {
  await logEvent('page_view', { page });
}

export async function logAdView(type: string) {
  await logEvent('ad_view', { type });
}

export async function logAISummaryRequest(symbol: string) {
  await logEvent('ai_summary_request', { symbol });
}

export async function logSubscriptionConversion(userId: string) {
  await logEvent('subscription_conversion', { userId });
} 