import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Button, ScrollView } from 'react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
      <Button title="Back" onPress={() => router.back()} />
      <ThemedText type="title">Privacy Policy</ThemedText>
      <ThemedText style={{ marginTop: 16 }}>
        This is a sample privacy policy. Your privacy is important to us. We collect only the data necessary to provide our services. Please review our full privacy policy for details.
      </ThemedText>
      <ThemedText style={{ marginTop: 16, color: '#888' }}>
        (Replace this text with your actual privacy policy.)
      </ThemedText>
    </ScrollView>
  );
} 