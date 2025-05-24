// newsService.ts
// Provides news fetching with offline cache fallback using AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// import { RAPIDAPI_KEY } from '@env';

const API_URL = 'https://yh-finance.p.rapidapi.com/stock/v2/get-news';
const API_HOST = 'yh-finance.p.rapidapi.com';

// Helper to get network status synchronously (fallback if hook not available)
async function isOnline() {
  try {
    // @ts-ignore
    const state = await import('@react-native-community/netinfo').then(m => m.default.fetch());
    return !!state.isConnected;
  } catch {
    return true; // Assume online if NetInfo fails
  }
}

export async function getNews(region = 'US', category = 'generalnews') {
  const cacheKey = `newsCache_${region}_${category}`;
  if (!(await isOnline())) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    throw new Error('Offline and no news cache available');
  }
  try {
    const response = await axios.get(API_URL, {
      params: { region, category },
      headers: {
        'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });
    const articles = response.data?.data || [];
    await AsyncStorage.setItem(cacheKey, JSON.stringify(articles));
    return articles;
  } catch (error) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    console.error('Error fetching news:', error);
    throw error;
  }
} 