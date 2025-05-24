// favoritesService.ts
// Provides favorites management with offline cache and action queueing for offline support.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

const COLLECTION = 'users';

async function isOnline() {
  try {
    // @ts-ignore
    const state = await import('@react-native-community/netinfo').then(m => m.default.fetch());
    return !!state.isConnected;
  } catch {
    return true;
  }
}

function getCacheKey(uid: string) {
  return `favoritesCache_${uid}`;
}

function getQueueKey(uid: string) {
  return `favoritesQueue_${uid}`;
}

export async function getFavorites() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const cacheKey = getCacheKey(user.uid);
  if (!(await isOnline())) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    return [];
  }
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, COLLECTION, user.uid));
  const favorites = userDoc.exists() ? userDoc.data().favorites || [] : [];
  await AsyncStorage.setItem(cacheKey, JSON.stringify(favorites));
  return favorites;
}

async function queueAction(uid: string, action: { type: 'add' | 'remove'; favorite: any }) {
  const queueKey = getQueueKey(uid);
  const queue = JSON.parse((await AsyncStorage.getItem(queueKey)) || '[]');
  queue.push(action);
  await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
}

export async function addFavorite(favorite: any) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  if (!(await isOnline())) {
    await queueAction(user.uid, { type: 'add', favorite });
    return;
  }
  const db = getFirestore();
  const userRef = doc(db, COLLECTION, user.uid);
  await setDoc(userRef, { favorites: arrayUnion(favorite) }, { merge: true });
  // Update cache
  const favorites = await getFavorites();
  await AsyncStorage.setItem(getCacheKey(user.uid), JSON.stringify(favorites));
}

export async function removeFavorite(favorite: any) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  if (!(await isOnline())) {
    await queueAction(user.uid, { type: 'remove', favorite });
    return;
  }
  const db = getFirestore();
  const userRef = doc(db, COLLECTION, user.uid);
  await updateDoc(userRef, { favorites: arrayRemove(favorite) });
  // Update cache
  const favorites = await getFavorites();
  await AsyncStorage.setItem(getCacheKey(user.uid), JSON.stringify(favorites));
}

export async function replayFavoritesQueue() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;
  const queueKey = getQueueKey(user.uid);
  const queue = JSON.parse((await AsyncStorage.getItem(queueKey)) || '[]');
  if (!queue.length) return;
  for (const action of queue) {
    if (action.type === 'add') {
      await addFavorite(action.favorite);
    } else if (action.type === 'remove') {
      await removeFavorite(action.favorite);
    }
  }
  await AsyncStorage.removeItem(queueKey);
} 