import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Re-add expo-in-app-purchases when compatible version is available
// import * as InAppPurchases from 'expo-in-app-purchases';
import { getApps } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const PRODUCT_IDS = ['your_subscription_product_id_here']; // TODO: Update with your real product IDs
const SUB_STATUS_KEY = 'subscriptionStatus';

const subscriptionService = {
  async getSubscriptionStatus(uid?: string): Promise<boolean> {
    if (!uid) return false;
    
    try {
      // Check if Firebase is initialized
      if (!getApps().length) {
        console.warn('Firebase not initialized, cannot get subscription status');
        return false;
      }
      
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', uid));
      const status = userDoc.exists() ? userDoc.data()?.subscription?.active : false;
      await AsyncStorage.setItem(SUB_STATUS_KEY, status ? 'active' : 'inactive');
      return !!status;
    } catch (error) {
      console.warn('Error getting subscription status:', error);
      return false;
    }
  },

  async getCachedSubscriptionStatus(): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(SUB_STATUS_KEY);
      return cached === 'active';
    } catch (error) {
      console.warn('Error getting cached subscription status:', error);
      return false;
    }
  },

  async purchaseSubscription(uid?: string): Promise<boolean> {
    // TODO: Implement when expo-in-app-purchases is compatible
    console.log('Purchase subscription not yet implemented');
    return false;
  },

  async restorePurchases(uid?: string): Promise<boolean> {
    // TODO: Implement when expo-in-app-purchases is compatible
    console.log('Restore purchases not yet implemented');
    if (!uid) throw new Error('User not logged in');
    
    // For now, just return false (no active subscription)
    await AsyncStorage.setItem(SUB_STATUS_KEY, 'inactive');
    return false;
  },
};

export default subscriptionService;
// Update PRODUCT_IDS above with your real Google Play/Apple product IDs. 