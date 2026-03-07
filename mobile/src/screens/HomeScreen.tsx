import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Placeholder home screen shown to authenticated users.
 * Core screens (Vehicles, Events, Lap Times) will be implemented in Phase 24.
 */
const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏁 Motorsports</Text>
        <Text style={styles.welcome}>
          Welcome back, {user?.firstName} {user?.lastName}!
        </Text>
        <Text style={styles.role}>Role: {user?.role}</Text>
        <Text style={styles.info}>
          Core screens (Vehicles, Events, Lap Times) are coming in Phase 24.
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  role: {
    fontSize: 14,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  info: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
