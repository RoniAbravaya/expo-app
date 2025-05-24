// analyticsService.ts
// Utility for logging analytics events using expo-firebase-analytics
// Make sure Firebase Analytics is enabled in the Firebase Console

import * as Analytics from 'expo-firebase-analytics';

export async function logEvent(name: string, params?: Record<string, any>) {
  try {
    await Analytics.logEvent(name, params);
  } catch (e) {
    // Optionally log error
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