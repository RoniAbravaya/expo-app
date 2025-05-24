/**
 * NotificationsScreen
 *
 * Allows users to register for push notifications, view their Expo push token, and see notification status/messages.
 * Shows helpful message for Expo Go limitations in SDK 53+.
 * Uses ThemedText for consistent styling.
 */
import { ThemedText } from '@/components/ThemedText';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet } from 'react-native';

const NOTIF_HISTORY_KEY = 'notificationHistory';

export default function NotificationsScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const { t } = useTranslation();

  const registerForPushNotifications = async () => {
    // Check if running in Expo Go
    if (Constants.appOwnership === 'expo') {
      Alert.alert(
        'Expo Go Limitation',
        'Push notifications are not available in Expo Go with SDK 53+. Use a development build or production build to test notifications.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('');
    try {
      if (!Constants.isDevice) {
        setError(t('notifications.mustUseDevice'));
        setLoading(false);
        return;
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        setError(t('notifications.permissionDenied'));
        setLoading(false);
        return;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      setToken(tokenData.data);
      setStatus(t('notifications.enabled'));
    } catch (e: any) {
      console.warn('Notifications error:', e);
      setError(e.message || t('notifications.errorRegistering'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">{t('notifications.title')}</ThemedText>
      
      {Constants.appOwnership === 'expo' && (
        <ThemedText style={styles.warningText}>
          ⚠️ Push notifications are not available in Expo Go with SDK 53+. 
          Use a development build to test notifications.
        </ThemedText>
      )}
      
      <Button title={t('notifications.registerButton')} onPress={registerForPushNotifications} disabled={loading} />
      {loading && <ActivityIndicator />}
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      {status && <ThemedText style={{ color: 'green' }}>{status}</ThemedText>}
      {token ? (
        <ThemedText selectable style={{ marginTop: 16 }}>
          {t('notifications.tokenLabel', { token })}
        </ThemedText>
      ) : !loading && !error && (
        <ThemedText style={{ color: '#888', marginTop: 16 }}>
          {t('notifications.tokenPlaceholder')}
        </ThemedText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  warningText: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
}); 