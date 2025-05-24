// login.tsx for Expo Admin App
// Google login with Firebase Auth and admin role check

import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, Title } from 'react-native-paper';

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB, // Web client ID
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      setError(null);
      const { id_token } = response.params;
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (userCred) => {
          // Check admin role in Firestore
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            router.replace('/');
          } else {
            setError('You are not an admin. Access denied.');
            await signOut(auth);
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Title>Admin Login</Title>
      <Text>Sign in with your Google account to access the admin dashboard.</Text>
      <Button mode="contained" style={styles.button} onPress={() => promptAsync()} disabled={!request || loading}>
        Sign in with Google
      </Button>
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {error && <Text style={{ color: 'red', marginTop: 16 }}>{error}</Text>}
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
    marginTop: 24,
    width: 220,
  },
}); 