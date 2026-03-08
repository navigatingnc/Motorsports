import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { RaceEvent } from '../types/event.types';
import { getEvents, isUpcoming } from '../services/event.service';

type Props = NativeStackScreenProps<AppStackParamList, 'Events'>;
type Tab = 'upcoming' | 'past';

/**
 * EventsScreen displays all race events split into Upcoming and Past tabs.
 * Tapping an event navigates to EventDetailScreen.
 */
const EventsScreen: React.FC<Props> = ({ navigation }) => {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await getEvents();
      setEvents(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load events.';
      setError(message);
    }
  }, []);

  useEffect(() => {
    fetchEvents().finally(() => setLoading(false));
  }, [fetchEvents]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const upcomingEvents = events
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter((e) => !isUpcoming(e))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string): string => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days > 0) return `In ${days} days`;
    return `${Math.abs(days)} days ago`;
  };

  const renderItem = ({ item }: { item: RaceEvent }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.75}
    >
      <View style={styles.cardTop}>
        <Text style={styles.eventName} numberOfLines={1}>
          {item.name}
        </Text>
        <View
          style={[
            styles.timeBadge,
            activeTab === 'past' ? styles.timeBadgePast : styles.timeBadgeUpcoming,
          ]}
        >
          <Text style={styles.timeBadgeText}>{getDaysUntil(item.date)}</Text>
        </View>
      </View>
      <Text style={styles.venue}>📍 {item.venue}</Text>
      <Text style={styles.date}>📅 {formatDate(item.date)}</Text>
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#E11D48" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏁 Events</Text>
        <Text style={styles.headerSubtitle}>{events.length} total events</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcomingEvents.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past ({pastEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchEvents} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E11D48"
              colors={['#E11D48']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No {activeTab === 'upcoming' ? 'upcoming' : 'past'} events.
              </Text>
              <Text style={styles.emptySubtext}>Pull down to refresh.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  centered: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: { backgroundColor: '#E11D48' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  eventName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F1F5F9',
    flex: 1,
  },
  timeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  timeBadgeUpcoming: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10B981' },
  timeBadgePast: { backgroundColor: 'rgba(100, 116, 139, 0.15)', borderWidth: 1, borderColor: '#475569' },
  timeBadgeText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  venue: { fontSize: 13, color: '#94A3B8' },
  date: { fontSize: 13, color: '#64748B' },
  description: { fontSize: 13, color: '#475569', lineHeight: 18, marginTop: 2 },
  errorBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
    gap: 12,
  },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#E11D48',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: '#475569', fontSize: 13 },
});

export default EventsScreen;
