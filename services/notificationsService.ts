// Notification service for registering and handling push notifications in Expo app.
// Handles Expo Go limitations and provides clear error messages for unsupported scenarios.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  // Expo Go does not support push notifications as of SDK 53+
  if (__DEV__ && (global as any).ExpoGo) {
    throw new Error('Push notifications are not supported in Expo Go. Use a development build. See https://docs.expo.dev/develop/development-builds/introduction/');
  }

  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      throw new Error('Failed to get push token for push notification!');
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    throw new Error('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
} 