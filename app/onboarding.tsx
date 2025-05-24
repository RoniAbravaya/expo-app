/**
 * OnboardingScreen
 *
 * Provides a multi-step onboarding experience using AppIntroSlider. Introduces users to the app's main features (Trending, Favorites, AI Summary).
 * Marks onboarding as complete in AsyncStorage and navigates to the main tabs. Uses ThemedText for consistent styling.
 */
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
  {
    key: 'one',
    title: t('onboarding.slide1Title'),
    text: t('onboarding.slide1Text'),
  },
  {
    key: 'two',
    title: t('onboarding.slide2Title'),
    text: t('onboarding.slide2Text'),
  },
  {
    key: 'three',
    title: t('onboarding.slide3Title'),
    text: t('onboarding.slide3Text'),
  },
];

type Slide = { key: string; title: string; text: string };

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const handleDone = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    Alert.alert(t('onboarding.complete'));
    router.replace('/'); // Go to main tabs
  };

  return (
    // @ts-ignore: AppIntroSlider works as a function component in Expo
    <AppIntroSlider
      data={slides}
      renderItem={({ item }: { item: Slide }) => (
        <View style={styles.slide}>
          <ThemedText type="title">{item.title}</ThemedText>
          <ThemedText>{item.text}</ThemedText>
        </View>
      )}
      onDone={handleDone}
      showSkipButton
      onSkip={handleDone}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
}); 