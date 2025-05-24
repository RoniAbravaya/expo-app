import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Button, ScrollView } from 'react-native';

export default function TermsScreen() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
      <Button title="Back" onPress={() => router.back()} />
      <ThemedText type="title">Terms of Service</ThemedText>
      <ThemedText style={{ marginTop: 16 }}>
        These are sample terms of service. By using this app, you agree to our terms and conditions. Please review our full terms for details.
      </ThemedText>
      <ThemedText style={{ marginTop: 16, color: '#888' }}>
        (Replace this text with your actual terms of service.)
      </ThemedText>
    </ScrollView>
  );
} 