import { Image } from 'expo-image';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Platform, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { registerForPushNotificationsAsync } from '@/services/notificationsService';

/**
 * HomeScreen
 *
 * The main landing screen of the app. Welcomes the user, provides quick start steps, and allows registration for push notifications.
 * Uses ParallaxScrollView, ThemedText, and HelloWave for a modern, engaging UI. Handles push notification registration and displays the token or errors.
 */
export default function HomeScreen() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleRegisterPush = async () => {
    setError(null);
    try {
      const token = await registerForPushNotificationsAsync();
      setPushToken(token);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('welcome')}</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.step1Title')}</ThemedText>
        <ThemedText>{t('home.step1Text', { keyFile: 'app/(tabs)/index.tsx', devTools: Platform.select({ ios: 'cmd + d', android: 'cmd + m', web: 'F12' }) })}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.step2Title')}</ThemedText>
        <ThemedText>{t('home.step2Text')}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.step3Title')}</ThemedText>
        <ThemedText>{t('home.step3Text')}</ThemedText>
      </ThemedView>
      <View style={{ marginVertical: 16 }}>
        <Button title={t('registerPush')} onPress={handleRegisterPush} />
        {pushToken && <ThemedText>{t('pushToken', { token: pushToken })}</ThemedText>}
        {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
