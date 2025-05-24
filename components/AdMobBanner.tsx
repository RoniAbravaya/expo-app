/**
 * AdMobBanner.tsx
 * 
 * AdMob banner component for displaying advertisements.
 * Shows placeholder in Expo Go (native module not available).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'; // Disabled for Expo Go

interface Props {
  isSubscriber: boolean;
}

export default function AdMobBannerComponent({ isSubscriber }: Props) {
  // Don't show ads if user is a subscriber
  if (isSubscriber) {
    return null;
  }

  // For Expo Go - show placeholder
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        [AdMob Banner Placeholder - Use development build for real ads]
      </Text>
    </View>
  );

  // For production builds with native modules:
  /*
  return (
    <BannerAd
      unitId={TestIds.ADAPTIVE_BANNER}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
  */
}

const styles = StyleSheet.create({
  placeholder: {
    height: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    margin: 8,
  },
  placeholderText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
}); 