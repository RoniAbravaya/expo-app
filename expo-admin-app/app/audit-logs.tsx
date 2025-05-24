// audit-logs.tsx for Expo Admin App
// Display recent user audit logs from Firestore

import { collection, getDocs, getFirestore, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Title } from 'react-native-paper';

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const db = getFirestore();
    getDocs(query(collection(db, 'user_audit_logs'), orderBy('timestamp', 'desc'), limit(20)))
      .then((snap) => {
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Title>User Audit Logs</Title>
      {loading ? <Text>Loading...</Text> : error ? <Text style={{ color: 'red' }}>{error}</Text> : logs.length === 0 ? <Text>No logs found.</Text> : logs.map((log) => (
        <Card key={log.id} style={styles.card}>
          <Card.Content>
            <Text style={{ fontWeight: 'bold' }}>{log.action}</Text>
            <Text>User: {log.userId}</Text>
            <Text>Admin: {log.adminId}</Text>
            <Text>Details: {log.details || '-'}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</Text>
          </Card.Content>
        </Card>
      ))}
      <Text style={{ marginTop: 24, color: '#888' }}>
        (Logs are written when admins perform sensitive actions. Expand as needed.)
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