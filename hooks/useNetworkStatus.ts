// useNetworkStatus.ts
// Custom hook to provide network connectivity status using @react-native-community/netinfo
// Returns { isConnected, netInfoState } for use in offline support and UI

// @ts-ignore
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { replayFavoritesQueue } from '../services/favoritesService';

export function useNetworkStatus() {
  const [netInfoState, setNetInfoState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetInfoState(state);
    });
    NetInfo.fetch().then(setNetInfoState);
    return () => unsubscribe();
  }, []);

  // Replay queued favorite actions when coming back online
  useEffect(() => {
    if (netInfoState?.isConnected) {
      replayFavoritesQueue();
    }
  }, [netInfoState?.isConnected]);

  const isConnected = !!netInfoState?.isConnected;
  return { isConnected, netInfoState };
} 