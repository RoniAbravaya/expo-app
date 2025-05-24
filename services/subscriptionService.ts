import AsyncStorage from '@react-native-async-storage/async-storage';
import * as InAppPurchases from 'expo-in-app-purchases';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import * as analyticsService from './analyticsService';

const PRODUCT_IDS = ['your_subscription_product_id_here']; // TODO: Update with your real product IDs
const SUB_STATUS_KEY = 'subscriptionStatus';

const subscriptionService = {
  async getSubscriptionStatus(uid?: string): Promise<boolean> {
    if (!uid) return false;
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, 'users', uid));
    const status = userDoc.exists() ? userDoc.data()?.subscription?.active : false;
    await AsyncStorage.setItem(SUB_STATUS_KEY, status ? 'active' : 'inactive');
    return !!status;
  },
  async getCachedSubscriptionStatus(): Promise<boolean> {
    const status = await AsyncStorage.getItem(SUB_STATUS_KEY);
    return status === 'active';
  },
  async purchaseSubscription(uid?: string): Promise<void> {
    if (!uid) throw new Error('User not logged in');
    await InAppPurchases.connectAsync();
    const { responseCode, results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
    if (responseCode !== InAppPurchases.IAPResponseCode.OK || !results.length) {
      throw new Error('Unable to fetch products');
    }
    const productId = results[0].productId;
    const purchaseResult = await InAppPurchases.purchaseItemAsync(productId);
    if (purchaseResult.responseCode !== InAppPurchases.IAPResponseCode.OK) {
      throw new Error('Purchase failed');
    }
    // Mark as active in Firestore
    const db = getFirestore();
    await setDoc(doc(db, 'users', uid), { subscription: { active: true, lastPurchase: Date.now() } }, { merge: true });
    await analyticsService.logSubscriptionConversion(uid);
    await AsyncStorage.setItem(SUB_STATUS_KEY, 'active');
    await InAppPurchases.disconnectAsync();
  },
  async restorePurchases(uid?: string): Promise<boolean> {
    if (!uid) throw new Error('User not logged in');
    await InAppPurchases.connectAsync();
    const history = await InAppPurchases.getPurchaseHistoryAsync();
    const hasActive = history.results.some((item) => PRODUCT_IDS.includes(item.productId));
    if (hasActive) {
      const db = getFirestore();
      await setDoc(doc(db, 'users', uid), { subscription: { active: true, lastRestore: Date.now() } }, { merge: true });
      await AsyncStorage.setItem(SUB_STATUS_KEY, 'active');
    } else {
      await AsyncStorage.setItem(SUB_STATUS_KEY, 'inactive');
    }
    await InAppPurchases.disconnectAsync();
    return hasActive;
  },
};

export default subscriptionService;
// Update PRODUCT_IDS above with your real Google Play/Apple product IDs. 