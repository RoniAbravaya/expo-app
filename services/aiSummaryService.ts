import axios from 'axios';
// import { OPENAI_API_KEY } from '@env';
import * as analyticsService from './analyticsService';

const API_URL = 'https://api.openai.com/v1/chat/completions';

export async function getAISummary(stock: { symbol: string; name: string }, priceHistory: any, news: any) {
  await analyticsService.logAISummaryRequest(typeof stock === 'string' ? stock : stock.symbol);
  const prompt = `Give a beginner-friendly summary for the stock ${stock.symbol} (${stock.name}) using the following price history and news.\nPrice history: ${JSON.stringify(priceHistory)}\nNews: ${JSON.stringify(news)}`;
  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful financial assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching AI summary:', error);
    throw error;
  }
} 