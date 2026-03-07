import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Application entry point.
 *
 * AuthProvider wraps the entire tree so that any screen can access
 * authentication state via the useAuth() hook.
 * RootNavigator handles conditional rendering of Auth vs. App stacks.
 */
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}
