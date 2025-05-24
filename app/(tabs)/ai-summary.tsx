import { ThemedText } from '@/components/ThemedText';
import { getAISummary } from '@/services/aiSummaryService';
import { getNews } from '@/services/newsService';
import { getStockHistory } from '@/services/stocksService';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Button, ScrollView, StyleSheet, TextInput } from 'react-native';

export default function AISummaryScreen() {
  const [symbol, setSymbol] = useState('AAPL');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState(false);
  const { t } = useTranslation();

  const handleGetSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary('');
    setFetchingData(true);
    try {
      // Fetch real price history and news
      const [priceHistory, news] = await Promise.all([
        getStockHistory(symbol),
        getNews('US', symbol),
      ]);
      setFetchingData(false);
      const result = await getAISummary(
        { symbol, name: symbol },
        priceHistory,
        news
      );
      setSummary(result);
    } catch (e: any) {
      setError(e.message);
      setFetchingData(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">{t('aiSummary.title')}</ThemedText>
      {!process.env.EXPO_PUBLIC_OPENAI_API_KEY && (
        <ThemedText style={{ color: 'orange', marginBottom: 8 }}>
          {t('aiSummary.warning')}
        </ThemedText>
      )}
      <TextInput
        style={styles.input}
        value={symbol}
        onChangeText={setSymbol}
        placeholder={t('aiSummary.placeholder')}
        autoCapitalize="characters"
      />
      <Button title={t('aiSummary.button')} onPress={handleGetSummary} disabled={loading || !process.env.EXPO_PUBLIC_OPENAI_API_KEY} />
      {fetchingData && <ThemedText style={{ color: '#888', marginTop: 8 }}>{t('aiSummary.fetching')}</ThemedText>}
      {loading && <ActivityIndicator />}
      {error && <ThemedText style={{ color: 'red' }}>{error || t('aiSummary.error')}</ThemedText>}
      {summary ? (
        <ThemedText>{summary}</ThemedText>
      ) : !loading && !error && (
        <ThemedText style={{ color: '#888', marginTop: 16 }}>
          {t('aiSummary.enterSymbol')}
        </ThemedText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginVertical: 8,
    width: 200,
    textAlign: 'center',
  },
}); 