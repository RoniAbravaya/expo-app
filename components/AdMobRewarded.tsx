/**
 * AdMobRewarded Component
 * 
 * Displays rewarded ads using Google AdMob with test IDs.
 * Shows ads after 1 minute of app usage for non-subscribers.
 */

import * as analyticsService from '@/services/analyticsService';
import subscriptionService from '@/services/subscriptionService';
import { useEffect, useRef, useState } from 'react';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

interface Props {
  isSubscriber?: boolean;
}

// Use test IDs for all environments to ensure safe testing
const adUnitId = TestIds.REWARDED;

export default function AdMobRewardedComponent({ isSubscriber: propIsSubscriber }: Props) {
  const [isSubscriber, setIsSubscriber] = useState(propIsSubscriber ?? false);
  const [shown, setShown] = useState(false);
  const timerRef = useRef<any>(null);
  const rewardedAd = useRef<RewardedAd | null>(null);

  useEffect(() => {
    if (propIsSubscriber !== undefined) return;
    subscriptionService.getCachedSubscriptionStatus().then(setIsSubscriber);
  }, [propIsSubscriber]);

  useEffect(() => {
    if (isSubscriber || shown || !adUnitId) return;
    
    // Create the rewarded ad
    const rewarded = RewardedAd.createForAdRequest(adUnitId!, {
      requestNonPersonalizedAdsOnly: false,
    });
    rewardedAd.current = rewarded;

    // Add event listeners
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded ad loaded');
    });

    const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward: any) => {
      console.log('User earned reward of ', reward);
      analyticsService.logAdView('rewarded');
      setShown(true);
    });

    timerRef.current = setTimeout(async () => {
      try {
        // Load the ad
        rewarded.load();
        
        // Wait a bit for the ad to load, then show it
        setTimeout(() => {
          if (rewarded.loaded) {
            rewarded.show();
          }
        }, 2000);
      } catch (err) {
        console.warn('AdMobRewarded error:', err);
      }
    }, 60000); // 1 minute

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, [isSubscriber, shown]);

  return null;
} 