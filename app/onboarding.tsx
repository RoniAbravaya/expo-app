/**
 * OnboardingScreen
 *
 * Simple onboarding screen that welcomes users and marks onboarding as complete.
 * Uses ThemedText for consistent styling.
 */
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      console.log('Onboarding marked as complete');
      router.replace('/(tabs)'); // Go to main tabs
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {t('onboarding.slide1Title')}
      </ThemedText>
      
      <ThemedText style={styles.text}>
        {t('onboarding.slide1Text')}
      </ThemedText>
      
      <ThemedText style={styles.text}>
        {t('onboarding.slide2Text')}
      </ThemedText>
      
      <ThemedText style={styles.text}>
        {t('onboarding.slide3Text')}
      </ThemedText>
      
      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <ThemedText style={styles.buttonText}>
          Get Started
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'white',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  text: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 