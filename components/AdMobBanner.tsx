/**
 * AdMobBanner Component
 * 
 * Displays banner ads using Google AdMob with test IDs.
 * Automatically hides ads for subscribed users.
 */

import subscriptionService from '@/services/subscriptionService';
import React, { useEffect, useState } from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface Props {
  isSubscriber?: boolean;
}

// Use test IDs for all environments to ensure safe testing
const adUnitId = TestIds.ADAPTIVE_BANNER;

export default function AdMobBannerComponent({ isSubscriber: propIsSubscriber }: Props) {
  const [isSubscriber, setIsSubscriber] = useState(propIsSubscriber ?? false);

  useEffect(() => {
    if (propIsSubscriber !== undefined) return;
    subscriptionService.getCachedSubscriptionStatus().then(setIsSubscriber);
  }, [propIsSubscriber]);

  // Don't show ads for subscribers
  if (isSubscriber) return null;
  
  // Don't show ads if no ad unit ID
  if (!adUnitId) return null;

  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.ADAPTIVE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: false,
      }}
      onAdLoaded={() => {
        console.log('Banner ad loaded');
      }}
      onAdFailedToLoad={(error: any) => {
        console.warn('AdMob error:', error);
      }}
    />
  );
} 