// OfflineBanner.tsx
// Displays a visible banner at the top of the screen when the device is offline.
// Uses the useNetworkStatus hook for connectivity detection.

import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const OfflineBanner = () => {
  const { isConnected } = useNetworkStatus();
  const { t } = useTranslation();
  if (isConnected) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{t('offline_banner')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#b71c1c',
    padding: 10,
    zIndex: 1000,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OfflineBanner; 