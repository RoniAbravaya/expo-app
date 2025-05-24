// AdminDashboard screen for Expo Admin App
// Main dashboard with navigation to User Management, Send Notification, and Analytics

import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, Title } from 'react-native-paper';

export default function AdminDashboard() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Title>Admin Dashboard</Title>
      <Text>Welcome, Admin! Choose a section:</Text>
      <Button mode="contained" style={styles.button} onPress={() => router.push('/user-management')}>User Management</Button>
      <Button mode="contained" style={styles.button} onPress={() => router.push('/send-notification')}>Send Notification</Button>
      <Button mode="contained" style={styles.button} onPress={() => router.push('/analytics')}>Analytics</Button>
      <Button mode="contained" style={styles.button} onPress={() => router.push('/audit-logs')}>Audit Logs</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  button: {
    marginTop: 16,
    width: 220,
  },
});
