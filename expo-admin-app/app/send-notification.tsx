// send-notification.tsx for Expo Admin App
// Compose and send push notifications to all, free, or subscribers

import { collection, getDocs, getFirestore, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, RadioButton, Text, TextInput, Title } from 'react-native-paper';

export default function SendNotificationScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'free' | 'subscribers'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notifHistory, setNotifHistory] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // TODO: Replace with your backend endpoint
      const res = await fetch('https://your-backend-endpoint/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, target }),
      });
      if (!res.ok) throw new Error('Failed to send notification');
      setSuccess(true);
      setTitle('');
      setBody('');
      setTarget('all');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNotifLoading(true);
    setNotifError(null);
    const db = getFirestore();
    getDocs(query(collection(db, 'notifications'), orderBy('created', 'desc'), limit(20)))
      .then((snap) => {
        setNotifHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      })
      .catch((e) => setNotifError(e.message))
      .finally(() => setNotifLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Title>Send Notification</Title>
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        label="Body"
        value={body}
        onChangeText={setBody}
        style={styles.input}
        multiline
      />
      <Text style={{ marginTop: 16 }}>Target Group:</Text>
      <RadioButton.Group onValueChange={v => setTarget(v as 'all' | 'free' | 'subscribers')} value={target}>
        <RadioButton.Item label="All Users" value="all" />
        <RadioButton.Item label="Free Users" value="free" />
        <RadioButton.Item label="Subscribers" value="subscribers" />
      </RadioButton.Group>
      <Button mode="contained" style={styles.button} onPress={handleSend} loading={loading} disabled={!title || !body || loading}>
        Send Notification
      </Button>
      {success && <Text style={{ color: 'green', marginTop: 16 }}>Notification sent!</Text>}
      {error && <Text style={{ color: 'red', marginTop: 16 }}>{error}</Text>}
      <Text style={{ marginTop: 16, color: '#888' }}>
        (TODO: Integrate with backend/cloud function to actually send notifications. Endpoint: /send-notification)
      </Text>
      <Title style={{ marginTop: 32 }}>Notification History</Title>
      {notifLoading ? <Text>Loading...</Text> : notifError ? <Text style={{ color: 'red' }}>{notifError}</Text> : notifHistory.length === 0 ? <Text>No notifications found.</Text> : notifHistory.map((n) => (
        <View key={n.id} style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold' }}>{n.title}</Text>
          <Text>{n.body}</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>{n.created ? new Date(n.created).toLocaleString() : ''}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    width: 220,
    alignSelf: 'center',
  },
}); 