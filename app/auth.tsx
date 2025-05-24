import { ThemedText } from '@/components/ThemedText';
import * as analyticsService from '@/services/analyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Button, StyleSheet, View } from 'react-native';
// TODO: Import Google Auth and Biometric logic

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "223350062068-gg239dtgv9r56s749kib2vd7leldpoff.apps.googleusercontent.com", // Your new Web OAuth client
    iosClientId: "223350062068-gg239dtgv9r56s749kib2vd7leldpoff.apps.googleusercontent.com", 
    androidClientId: "223350062068-gg239dtgv9r56s749kib2vd7leldpoff.apps.googleusercontent.com", 
    webClientId: "223350062068-gg239dtgv9r56s749kib2vd7leldpoff.apps.googleusercontent.com", // Your new Web OAuth client
    redirectUri: "https://auth.expo.io/@anonymous/expo-app", // More specific redirect URI
  });
  const { t } = useTranslation();

  React.useEffect(() => {
    // Check if biometric is enabled
    AsyncStorage.getItem('biometricEnabled').then((val) => {
      setBiometricEnabled(val === 'true');
    });
  }, []);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then(async () => {
          setLoading(false);
          // Prompt to enable biometric after successful Google login
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const supported = await LocalAuthentication.isEnrolledAsync();
          if (hasHardware && supported) {
            Alert.alert(
              t('auth.enableBiometricTitle'),
              t('auth.enableBiometricMsg'),
              [
                {
                  text: t('yes'),
                  onPress: async () => {
                    await AsyncStorage.setItem('biometricEnabled', 'true');
                    setBiometricEnabled(true);
                    Alert.alert(t('auth.biometricEnabled'));
                  },
                },
                {
                  text: t('no'),
                  onPress: async () => {
                    await AsyncStorage.setItem('biometricEnabled', 'false');
                    setBiometricEnabled(false);
                  },
                  style: 'cancel',
                },
              ]
            );
          }
          await analyticsService.logLogin('google');
        })
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      setError(t('auth.googleLoginFailed'));
    }
  }, [response]);

  const handleGoogleLogin = () => {
    setError(null);
    promptAsync();
  };

  const handleBiometric = async () => {
    setError(null);
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const supported = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !supported) {
      Alert.alert(t('auth.biometricUnavailable'));
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('auth.biometricPrompt'),
    });
    if (result.success) {
      // Simulate successful login (in real app, restore session or re-auth)
      Alert.alert(t('auth.biometricSuccess'));
      await analyticsService.logLogin('biometric');
    } else {
      setError(t('auth.biometricFailed'));
    }
  };

  // For testing: reset onboarding and biometric
  const handleResetOnboarding = async () => {
    await AsyncStorage.removeItem('onboardingComplete');
    await AsyncStorage.removeItem('biometricEnabled');
    setBiometricEnabled(false);
    Alert.alert(t('auth.resetFlags'));
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">{t('auth.title')}</ThemedText>
      {loading ? <ActivityIndicator /> : <Button title={t('auth.googleButton')} onPress={handleGoogleLogin} />}
      {biometricEnabled && <Button title={t('auth.biometricButton')} onPress={handleBiometric} />}
      <Button title={t('auth.resetButton')} onPress={handleResetOnboarding} />
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
}); 