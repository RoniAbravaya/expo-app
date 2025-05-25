import { ThemedText } from '@/components/ThemedText';
import * as analyticsService from '@/services/analyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
// TODO: Import Google Auth and Biometric logic

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "223350062068-navgqg2tu1ktidmjehn1svnelrv93lo8.apps.googleusercontent.com", // Android client ID
    iosClientId: "223350062068-navgqg2tu1ktidmjehn1svnelrv93lo8.apps.googleusercontent.com", 
    androidClientId: "223350062068-navgqg2tu1ktidmjehn1svnelrv93lo8.apps.googleusercontent.com", 
    webClientId: "223350062068-gg239dtgv9r56s749kib2vd7leldpoff.apps.googleusercontent.com", // Keep web client for web builds
    redirectUri: "expoapp://auth",
  });
  
  // Debug: Log the redirect URI being used
  console.log('🔍 Redirect URI being used:', "expoapp://auth");
  
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
    <View style={styles.outerContainer}>
      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>{t('auth.title')}</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>{t('auth.subtitle') || 'to continue to Magic Patterns'}</ThemedText>
        {/* Email and password fields for visual only, not functional */}
        <TextInput
          style={styles.input}
          placeholder={t('auth.emailPlaceholder') || 'Email'}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder={t('auth.passwordPlaceholder') || 'Password'}
          placeholderTextColor="#9ca3af"
          secureTextEntry
        />
        <TouchableOpacity style={styles.forgotContainer}>
          <ThemedText type="link" style={styles.forgot}>{t('auth.forgotPassword') || 'Forgot password?'}</ThemedText>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : (
          <Button title={t('auth.googleButton')} onPress={handleGoogleLogin} color="#6366f1" />
        )}
        {biometricEnabled && <Button title={t('auth.biometricButton')} onPress={handleBiometric} color="#6366f1" />}
        <Button title={t('auth.resetButton')} onPress={handleResetOnboarding} color="#e5e7eb" />
        {error && <ThemedText style={{ color: 'red', marginTop: 16 }}>{error}</ThemedText>}
      </View>
      <View style={styles.bottomPrompt}>
        <ThemedText style={styles.bottomText}>{t('auth.noAccount') || "Don't have an account?"} </ThemedText>
        <TouchableOpacity>
          <ThemedText type="link" style={styles.signUp}>{t('auth.signUp') || 'Sign up'}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'stretch',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '400',
  },
  input: {
    height: 48,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    fontSize: 16,
    color: '#111827',
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgot: {
    color: '#6366f1',
    fontWeight: '500',
  },
  bottomPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  bottomText: {
    color: '#6b7280',
    fontSize: 16,
  },
  signUp: {
    color: '#6366f1',
    fontWeight: '500',
    fontSize: 16,
  },
}); 