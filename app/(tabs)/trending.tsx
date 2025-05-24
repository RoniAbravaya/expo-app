import AdMobBannerComponent from '@/components/AdMobBanner';
import { ThemedText } from '@/components/ThemedText';
import * as analyticsService from '@/services/analyticsService';
import { addFavorite } from '@/services/favoritesService';
import { getStockHistory, getTrendingStocks } from '@/services/stocksService';
import subscriptionService from '@/services/subscriptionService';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, StyleSheet, TextInput, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Button, Card } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

/**
 * TrendingScreen
 *
 * Displays a list of trending stocks fetched from an external API (via getTrendingStocks service).
 * Handles loading, error, and empty states. Uses ThemedText for consistent styling.
 */
export default function TrendingScreen() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [historyData, setHistoryData] = useState<{ [symbol: string]: number[] }>({});
  const [historyLoading, setHistoryLoading] = useState<{ [symbol: string]: boolean }>({});
  const [isSubscriber, setIsSubscriber] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    getTrendingStocks()
      .then((data) => setStocks(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    subscriptionService.getCachedSubscriptionStatus().then(setIsSubscriber);
  }, []);

  useEffect(() => {
    if (!isSubscriber) analyticsService.logAdView('banner');
  }, [isSubscriber]);

  // Fetch historical data for each stock when stocks change
  useEffect(() => {
    stocks.forEach((item) => {
      if (!historyData[item.symbol] && !historyLoading[item.symbol]) {
        setHistoryLoading((prev) => ({ ...prev, [item.symbol]: true }));
        getStockHistory(item.symbol).then((closes) => {
          setHistoryData((prev) => ({ ...prev, [item.symbol]: closes }));
          setHistoryLoading((prev) => ({ ...prev, [item.symbol]: false }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks]);

  const filteredStocks = stocks.filter(
    (item) =>
      item.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      item.shortName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFavorite = (symbol: string, shortName: string) => {
    addFavorite({ symbol, shortName });
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
      <ThemedText type="title">{t('trendingScreen.title')}</ThemedText>
      <TextInput
        style={styles.searchBar}
        placeholder={t('trendingScreen.searchBarPlaceholder')}
        value={search}
        onChangeText={setSearch}
      />
      {filteredStocks.length === 0 ? (
        <ThemedText style={{ color: '#888', marginTop: 16 }}>
          {t('trendingScreen.noStocksFound')}
        </ThemedText>
      ) : (
        filteredStocks.map((item) => (
          <Card key={item.symbol} style={styles.card}>
            <Card.Title title={`${item.symbol} - ${item.shortName}`} />
            <Card.Content>
              <ThemedText>{t('trendingScreen.price', { price: item.regularMarketPrice })}</ThemedText>
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
                            : [item.regularMarketPrice, item.regularMarketPrice * 0.98, item.regularMarketPrice * 1.01],
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
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleAddFavorite(item.symbol, item.shortName)}>{t('trendingScreen.addToFavorites')}</Button>
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
  searchBar: {
    width: '100%',
    padding: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: '#fff',
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
}); 