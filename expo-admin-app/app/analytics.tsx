// analytics.tsx for Expo Admin App
// Show app/user stats (mock data, ready for real Firestore integration)

import { collection, getDocs, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Title } from 'react-native-paper';

const mockStats = {
  totalUsers: 1234,
  activeUsers: 456,
  aiSummaryRequests: 789,
  adImpressions: 2345,
  mostFavoritedStocks: ['AAPL', 'TSLA', 'GOOG'],
  mostViewedNews: ['Fed raises rates', 'Tesla earnings', 'Apple WWDC'],
  subscriptionConversions: 123,
};

export default function AnalyticsScreen() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [subCount, setSubCount] = useState<number | null>(null);
  const [disabledCount, setDisabledCount] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [freeCount, setFreeCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topStocks, setTopStocks] = useState<string[]>([]);
  const [topNews, setTopNews] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const db = getFirestore();
    getDocs(collection(db, 'users'))
      .then((snap) => {
        setUserCount(snap.size);
        setSubCount(snap.docs.filter(doc => doc.data().subscription?.active).length);
        setDisabledCount(snap.docs.filter(doc => doc.data().disabled).length);
        setAdminCount(snap.docs.filter(doc => doc.data().role === 'admin').length);
        setFreeCount(snap.docs.filter(doc => !doc.data().subscription?.active).length);
        // Aggregate favorites
        const stockCounts: Record<string, number> = {};
        const newsCounts: Record<string, number> = {};
        snap.docs.forEach(docSnap => {
          const favs = docSnap.data().favorites || [];
          favs.forEach((fav: any) => {
            if (fav.symbol) {
              stockCounts[fav.symbol] = (stockCounts[fav.symbol] || 0) + 1;
            }
            if (fav.newsId) {
              newsCounts[fav.newsId] = (newsCounts[fav.newsId] || 0) + 1;
            }
          });
        });
        setTopStocks(Object.entries(stockCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k));
        setTopNews(Object.entries(newsCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Title>Analytics</Title>
      {loading ? <Text>Loading...</Text> : error ? <Text style={{ color: 'red' }}>{error}</Text> : <>
        <Card style={styles.card}><Card.Content><Text>Total Users: {userCount}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>Admins: {adminCount}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>Disabled Users: {disabledCount}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>Subscription Conversions: {subCount}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>Free Users: {freeCount}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>Active Users: {mockStats.activeUsers}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>AI Summary Requests: {mockStats.aiSummaryRequests}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>Ad Impressions: {mockStats.adImpressions}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>Most Favorited Stocks: {topStocks.length ? topStocks.join(', ') : 'N/A'}</Text></Card.Content></Card>
        <Card style={styles.card}><Card.Content><Text>Most Viewed News: {topNews.length ? topNews.join(', ') : 'N/A'}</Text></Card.Content></Card>
      </>}
      <Text style={{ marginTop: 24, color: '#888' }}>
        (TODO: For large user bases, aggregate favorites server-side for performance.)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
}); 