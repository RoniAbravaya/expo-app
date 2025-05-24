import AdMobBannerComponent from '@/components/AdMobBanner';
import { ThemedText } from '@/components/ThemedText';
import * as analyticsService from '@/services/analyticsService';
import { getNews } from '@/services/newsService';
import subscriptionService from '@/services/subscriptionService';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { Button, Card } from 'react-native-paper';

/**
 * NewsScreen
 *
 * Displays a list of news articles fetched from an external API (via getNews service).
 * Handles loading, error, and empty states. Uses ThemedText for consistent styling.
 */
export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    getNews()
      .then((data) => setNews(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    subscriptionService.getCachedSubscriptionStatus().then(setIsSubscriber);
  }, []);

  useEffect(() => {
    if (!isSubscriber) analyticsService.logAdView('banner');
  }, [isSubscriber]);

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
      <ThemedText type="title">{t('news.title')}</ThemedText>
      {news.length === 0 ? (
        <ThemedText style={{ color: '#888', marginTop: 16 }}>
          {t('noNewsArticlesFound')}
        </ThemedText>
      ) : (
        news.map((item) => (
          <Card key={item.uuid} style={styles.card}>
            <Card.Title title={item.title} subtitle={item.publisher} />
            <Card.Content>
              <ThemedText>{item.summary}</ThemedText>
              <ThemedText style={styles.date}>
                {item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toLocaleString() : ''}
              </ThemedText>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => Linking.openURL(item.link)}>{t('readMore')}</Button>
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
  date: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
}); 