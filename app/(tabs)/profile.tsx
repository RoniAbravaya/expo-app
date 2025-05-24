import { ThemedText } from '@/components/ThemedText';
import subscriptionService from '@/services/subscriptionService';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Picker, StyleSheet, View } from 'react-native';
import i18n, { setLanguage } from '../i18n';

/**
 * ProfileScreen
 *
 * Displays the current user's profile and settings, including sign out, theme toggle, and language selection (placeholders).
 * Handles error states and shows user info from Firebase Auth.
 * Uses ThemedText for consistent styling.
 */

export default function ProfileScreen() {
  const user = getAuth().currentUser;
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<'active' | 'inactive' | 'loading'>('loading');
  const [subLoading, setSubLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setSubStatus('loading');
    subscriptionService.getSubscriptionStatus(user.uid)
      .then((status) => setSubStatus(status ? 'active' : 'inactive'))
      .catch(() => setSubStatus('inactive'));
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Placeholder handlers for theme and language
  const handleThemeToggle = () => {};

  const handleSubscribe = async () => {
    setSubLoading(true);
    setError(null);
    try {
      await subscriptionService.purchaseSubscription(user?.uid);
      setSubStatus('active');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubLoading(false);
    }
  };

  const handleRestore = async () => {
    setSubLoading(true);
    setError(null);
    try {
      const restored = await subscriptionService.restorePurchases(user?.uid);
      setSubStatus(restored ? 'active' : 'inactive');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubLoading(false);
    }
  };

  const handlePrivacy = () => router.navigate('/privacy' as any);
  const handleTerms = () => router.navigate('/terms' as any);

  const handleDeleteAccount = async () => {
    Alert.alert(
      t('delete_account'),
      t('confirm_delete'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) throw new Error(t('no_user_signed_in'));
              // Delete Firestore user doc
              const db = getFirestore();
              await deleteDoc(doc(db, 'users', user.uid));
              // Delete Auth user
              await user.delete();
              Alert.alert(t('account_deleted'), t('account_deleted_message'));
            } catch (e: any) {
              Alert.alert(t('error'), e.message || t('failed_delete_account'));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">{t('profile')} & {t('settings')}</ThemedText>
      {user ? (
        <>
          <ThemedText>{user.displayName || user.email}</ThemedText>
          <ThemedText>{user.email}</ThemedText>
          <ThemedText style={{ marginTop: 16, fontWeight: 'bold' }}>{t('subscription_status', { status: subStatus === 'loading' ? t('processing') : subStatus })}</ThemedText>
          <ThemedText style={{ marginTop: 8, fontWeight: 'bold' }}>{t('subscription_benefits')}</ThemedText>
          <ThemedText>- {t('remove')} all ads</ThemedText>
          <ThemedText>- Increased AI summary limit</ThemedText>
          <ThemedText>- Premium support</ThemedText>
          {subStatus === 'inactive' && !subLoading && (
            <Button title={t('subscribe')} onPress={handleSubscribe} />
          )}
          <Button title={t('restore_purchases')} onPress={handleRestore} disabled={subLoading} />
          {subLoading && <ThemedText>{t('processing')}</ThemedText>}
        </>
      ) : (
        <ThemedText style={{ color: '#888', marginTop: 16 }}>{t('error')}</ThemedText>
      )}
      <Button title={t('sign_out')} onPress={handleSignOut} />
      <Button title={t('toggle_theme')} onPress={handleThemeToggle} />
      <ThemedText style={{ marginTop: 16 }}>{t('select_language')}</ThemedText>
      <Picker
        selectedValue={selectedLanguage}
        style={{ width: 200, marginBottom: 16 }}
        onValueChange={async (itemValue) => {
          setSelectedLanguage(itemValue);
          await setLanguage(itemValue);
        }}
      >
        <Picker.Item label={t('language_en')} value="en" />
        <Picker.Item label={t('language_zh')} value="zh" />
        <Picker.Item label={t('language_hi')} value="hi" />
        <Picker.Item label={t('language_es')} value="es" />
        <Picker.Item label={t('language_ar')} value="ar" />
      </Picker>
      <Button title={t('privacy_policy')} onPress={handlePrivacy} />
      <Button title={t('terms_of_service')} onPress={handleTerms} />
      <Button title={t('delete_account')} color="#b71c1c" onPress={handleDeleteAccount} />
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
}); 