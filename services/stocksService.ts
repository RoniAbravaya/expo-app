import axios from 'axios';
// import { RAPIDAPI_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://yh-finance.p.rapidapi.com/market/v2/get-trending-tickers';
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

export async function getTrendingStocks(region = 'US') {
  const cacheKey = 'trendingStocksCache';
  if (!(await isOnline())) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    throw new Error('Offline and no trending stocks cache available');
  }
  try {
    const response = await axios.get(API_URL, {
      params: { region },
      headers: {
        'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });
    const quotes = response.data?.finance?.result?.[0]?.quotes || [];
    await AsyncStorage.setItem(cacheKey, JSON.stringify(quotes));
    return quotes;
  } catch (error) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    console.error('Error fetching trending stocks:', error);
    throw error;
  }
}

export async function getStockHistory(symbol: string, interval = '1d', range = '5d') {
  const cacheKey = `stockHistoryCache_${symbol}`;
  if (!(await isOnline())) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    return [];
  }
  try {
    const response = await axios.get('https://yh-finance.p.rapidapi.com/stock/v3/get-chart', {
      params: { symbol, interval, range },
      headers: {
        'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });
    const closes = response.data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
    const filtered = closes.filter((v: number | null) => typeof v === 'number');
    await AsyncStorage.setItem(cacheKey, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    console.error('Error fetching stock history:', error);
    return [];
  }
} 