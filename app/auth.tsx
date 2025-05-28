import { ThemedText } from '@/components/ThemedText';
import { getGoogleConfig, getRedirectUri } from '@/constants/googleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import { getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  // Get the appropriate Google config for current environment
  const googleConfig = getGoogleConfig();
  const redirectUri = getRedirectUri();
  
  const isExpoGo = Constants.appOwnership === 'expo';
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: googleConfig.androidClientId,
    iosClientId: googleConfig.iosClientId,
    webClientId: googleConfig.webClientId,
    redirectUri: redirectUri,
  });
  
  console.log('🔍 Auth Request Config:', {
    androidClientId: googleConfig.androidClientId,
    iosClientId: googleConfig.iosClientId,
    webClientId: googleConfig.webClientId,
    redirectUri: redirectUri,
  });

  React.useEffect(() => {
    // Check if biometric is enabled
    AsyncStorage.getItem('biometricEnabled').then((val) => {
      setBiometricEnabled(val === 'true');
    });
  }, []);

  React.useEffect(() => {
    console.log('🔍 Google Auth Response:', response);
    
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      console.log('✅ Google Auth Success - ID Token:', id_token ? 'Present' : 'Missing');
      
      if (!id_token) {
        setError('No ID token received from Google');
        setLoading(false);
        return;
      }
      
      // Check if Firebase is initialized
      if (!getApps().length) {
        setError('Firebase not initialized');
        setLoading(false);
        return;
      }
      
      try {
        const auth = getAuth();
        const credential = GoogleAuthProvider.credential(id_token, access_token);
        setLoading(true);
        
        signInWithCredential(auth, credential)
          .then(async (userCredential) => {
            console.log('✅ Firebase Auth Success:', userCredential.user.email);
            setLoading(false);
            setError(null);
            
            // Prompt to enable biometric after successful Google login
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const supported = await LocalAuthentication.isEnrolledAsync();
            if (hasHardware && supported) {
              Alert.alert(
                'Enable Biometric Login?',
                'Would you like to enable biometric authentication for faster login?',
                [
                  {
                    text: 'Yes',
                    onPress: async () => {
                      await AsyncStorage.setItem('biometricEnabled', 'true');
                      setBiometricEnabled(true);
                      Alert.alert('Biometric authentication enabled!');
                    },
                  },
                  {
                    text: 'No',
                    onPress: async () => {
                      await AsyncStorage.setItem('biometricEnabled', 'false');
                      setBiometricEnabled(false);
                    },
                    style: 'cancel',
                  },
                ]
              );
            }
          })
          .catch((error) => {
            console.error('❌ Firebase Auth Error:', error);
            setError(`Firebase Auth Error: ${error.message}`);
            setLoading(false);
          });
      } catch (error) {
        console.error('❌ Auth Setup Error:', error);
        setError(`Auth Setup Error: ${error}`);
        setLoading(false);
      }
    } else if (response?.type === 'error') {
      console.error('❌ Google Auth Error:', response.error);
      setError(`Google Auth Error: ${response.error?.message || 'Unknown error'}`);
      setLoading(false);
    } else if (response?.type === 'cancel') {
      console.log('⚠️ Google Auth Cancelled');
      setError('Google sign-in was cancelled');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    console.log('🚀 Starting Google Login...');
    setError(null);
    setLoading(true);
    
    try {
      const result = await promptAsync();
      console.log('🔍 Prompt Result:', result);
      
      // If the result is not success, reset loading state
      if (result.type !== 'success') {
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Prompt Error:', error);
      setError(`Login Error: ${error}`);
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    setError(null);
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const supported = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !supported) {
      Alert.alert('Biometric authentication is not available on this device');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with biometrics',
    });
    if (result.success) {
      Alert.alert('Biometric authentication successful!');
    } else {
      setError('Biometric authentication failed');
    }
  };

  // For testing: reset onboarding and biometric
  const handleResetOnboarding = async () => {
    await AsyncStorage.removeItem('onboardingComplete');
    await AsyncStorage.removeItem('biometricEnabled');
    setBiometricEnabled(false);
    Alert.alert('App flags reset! Restart the app to see onboarding.');
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>Sign in to continue to your account</ThemedText>
        
        {/* Email and password fields for visual only, not functional */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
        />
        <TouchableOpacity style={styles.forgotContainer}>
          <ThemedText type="link" style={styles.forgot}>Forgot password?</ThemedText>
        </TouchableOpacity>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <ThemedText style={styles.loadingText}>Signing in...</ThemedText>
          </View>
        ) : (
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
          </TouchableOpacity>
        )}
        
        {biometricEnabled && (
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometric}>
            <ThemedText style={styles.biometricButtonText}>Use Biometric Login</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
          <ThemedText style={styles.resetButtonText}>Reset App (Dev Only)</ThemedText>
        </TouchableOpacity>
        
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}
      </View>
      
      <View style={styles.bottomPrompt}>
        <ThemedText style={styles.bottomText}>Don't have an account? </ThemedText>
        <TouchableOpacity>
          <ThemedText type="link" style={styles.signUp}>Sign up</ThemedText>
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
  googleButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
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