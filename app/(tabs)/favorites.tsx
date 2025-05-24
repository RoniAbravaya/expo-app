import AdMobBannerComponent from '@/components/AdMobBanner';
import { ThemedText } from '@/components/ThemedText';
import * as analyticsService from '@/services/analyticsService';
import { getFavorites, removeFavorite } from '@/services/favoritesService';
import { getStockHistory } from '@/services/stocksService';
import subscriptionService from '@/services/subscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Button, Card, Snackbar } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

function navigateToAISummary(symbol: string) {
  // Placeholder for navigation to AI Summary screen
  // e.g., useRouter().push(`/ai-summary?symbol=${symbol}`)
  alert(`Navigate to AI Summary for ${symbol}`);
}

/**
 * FavoritesScreen
 *
 * Displays a list of the user's favorite stocks, fetched from Firestore (via favoritesService).
 * Allows adding/removing a dummy favorite for demo purposes. Handles loading, error, and empty states.
 * Uses ThemedText for consistent styling.
 */
export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<{ [symbol: string]: number[] }>({});
  const [historyLoading, setHistoryLoading] = useState<{ [symbol: string]: boolean }>({});
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [queueVisible, setQueueVisible] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [syncCompleteVisible, setSyncCompleteVisible] = useState(false);
  const { t } = useTranslation();

  const fetchFavorites = () => {
    setLoading(true);
    getFavorites()
      .then(setFavorites)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    subscriptionService.getCachedSubscriptionStatus().then(setIsSubscriber);
  }, []);

  useEffect(() => {
    if (!isSubscriber) analyticsService.logAdView('banner');
  }, [isSubscriber]);

  // Fetch historical data for each favorite
  useEffect(() => {
    favorites.forEach((item) => {
      if (!historyData[item.symbol] && !historyLoading[item.symbol]) {
        setHistoryLoading((prev) => ({ ...prev, [item.symbol]: true }));
        getStockHistory(item.symbol).then((closes) => {
          setHistoryData((prev) => ({ ...prev, [item.symbol]: closes }));
          setHistoryLoading((prev) => ({ ...prev, [item.symbol]: false }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites]);

  // Helper to check for queued actions
  const checkQueue = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const queueKey = `favoritesQueue_${user.uid}`;
    const queue = JSON.parse((await AsyncStorage.getItem(queueKey)) || '[]');
    setSyncCompleteVisible((prev) => queueCount > 0 && queue.length === 0);
    setQueueCount(queue.length);
    setQueueVisible(queue.length > 0);
  };

  useEffect(() => {
    checkQueue();
    // Optionally, add a focus listener if using navigation
    // const unsubscribe = navigation.addListener('focus', checkQueue);
    // return unsubscribe;
  }, [favorites]);

  const handleRemove = async (favorite: any) => {
    await removeFavorite(favorite);
    fetchFavorites();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="title">{t('favorites')}</ThemedText>
      {/* Snackbar for queued actions */}
      <Snackbar
        visible={queueVisible}
        onDismiss={() => setQueueVisible(false)}
        duration={6000}
        action={{ label: 'OK', onPress: () => setQueueVisible(false) }}
      >
        {queueCount > 0
          ? t('pending_favorites', { count: queueCount, plural: queueCount > 1 ? 's' : '' })
          : ''}
      </Snackbar>
      {/* Snackbar for sync completion */}
      <Snackbar
        visible={syncCompleteVisible}
        onDismiss={() => setSyncCompleteVisible(false)}
        duration={4000}
        style={{ backgroundColor: '#388e3c' }}
      >
        {t('sync_complete')}
      </Snackbar>
      {favorites.length === 0 ? (
        <ThemedText style={{ color: '#888', marginTop: 16 }}>{t('no_favorites')}</ThemedText>
      ) : (
        favorites.map((item) => (
          <Card key={item.symbol} style={styles.card}>
            <Card.Title title={`${item.symbol} - ${item.name || item.shortName}`} />
            <Card.Content>
              {/* Mini chart and price */}
              {historyLoading[item.symbol] ? (
                <ActivityIndicator style={{ marginVertical: 8 }} />
              ) : (
                <LineChart
                  data={{
                    labels: [],
                    datasets: [
                      {
                        data:
                          historyData[item.symbol]?.length > 0
                            ? historyData[item.symbol]
                            : [100, 98, 101],
                      },
                    ],
                  }}
                  width={screenWidth - 48}
                  height={100}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    labelColor: () => '#888',
                    propsForDots: { r: '0' },
                  }}
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withHorizontalLabels={false}
                  withVerticalLabels={false}
                  style={{ marginVertical: 8 }}
                />
              )}
              <ThemedText>
                {t('latest_price', {
                  price:
                    historyData[item.symbol]?.length > 0
                      ? historyData[item.symbol][historyData[item.symbol].length - 1].toFixed(2)
                      : '--',
                })}
              </ThemedText>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleRemove(item)}>{t('remove')}</Button>
              <Button onPress={() => navigateToAISummary(item.symbol)}>{t('ai_summary_button')}</Button>
            </Card.Actions>
          </Card>
        ))
      )}
      <AdMobBannerComponent isSubscriber={isSubscriber} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
}); 