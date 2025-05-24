/**
 * AdMobRewarded.tsx
 * 
 * AdMob rewarded video component for premium features.
 * Shows placeholder in Expo Go (native module not available).
 */
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads'; // Disabled for Expo Go

interface Props {
  isSubscriber: boolean;
}

export default function AdMobRewardedComponent({ isSubscriber }: Props) {
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);

  // Don't show for subscribers
  if (isSubscriber) {
    return null;
  }

  // For Expo Go - show placeholder
  const showRewardedAd = () => {
    Alert.alert(
      'Rewarded Ad Placeholder',
      'This would show a rewarded video ad in a development build. Reward granted for testing!',
      [{ text: 'OK', onPress: () => console.log('Mock reward granted') }]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={showRewardedAd}>
        <Text style={styles.buttonText}>Watch Ad for Reward (Mock)</Text>
      </TouchableOpacity>
    </View>
  );

  // For production builds with native modules:
  /*
  const [rewarded, setRewarded] = useState<RewardedAd | null>(null);
  
  useEffect(() => {
    const rewardedAd = RewardedAd.createForAdRequest(TestIds.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setRewardedAdLoaded(true);
      setRewarded(rewardedAd);
    });

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward of ', reward);
        // Handle reward logic here
      }
    );

    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  return rewardedAdLoaded ? (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => rewarded?.show()}
      >
        <Text style={styles.buttonText}>Watch Ad for Reward</Text>
      </TouchableOpacity>
    </View>
  ) : null;
  */
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 