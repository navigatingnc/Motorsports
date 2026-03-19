import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { syncQueuedData } from './src/services/sync.service';

/**
 * Application entry point.
 *
 * AuthProvider wraps the entire tree so that any screen can access
 * authentication state via the useAuth() hook.
 * RootNavigator handles conditional rendering of Auth vs. App stacks.
 */
export default function App() {
  useEffect(() => {
    // Attempt to sync offline data when the app starts
    syncQueuedData();
    
    // Set up an interval for background sync
    const interval = setInterval(() => {
      syncQueuedData();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}
