import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { RaceEvent, WeatherData, SetupSheet } from '../types/event.types';
import {
  getEvent,
  getEventWeather,
  getEventSetups,
  describeWeatherCode,
} from '../services/event.service';

type Props = NativeStackScreenProps<AppStackParamList, 'EventDetail'>;

/**
 * EventDetailScreen shows full event information including:
 * - Event metadata (name, venue, date, description)
 * - Weather widget (temperature, wind speed, conditions)
 * - Setup sheets associated with the event
 */
const EventDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId } = route.params;

  const [event, setEvent] = useState<RaceEvent | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [setups, setSetups] = useState<SetupSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [eventData, weatherData, setupData] = await Promise.all([
        getEvent(eventId),
        getEventWeather(eventId),
        getEventSetups(eventId),
      ]);
      setEvent(eventData);
      setWeather(weatherData);
      setSetups(setupData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load event details.';
      setError(message);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#E11D48" />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Event not found.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const weatherInfo = weather ? describeWeatherCode(weather.weathercode) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#E11D48" />
        }
      >
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={styles.backLink}>← Events</Text>
        </TouchableOpacity>

        {/* Event Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{event.name}</Text>
          <Text style={styles.heroVenue}>📍 {event.venue}</Text>
          <Text style={styles.heroDate}>📅 {formatDate(event.date)}</Text>
          {event.description ? (
            <Text style={styles.heroDescription}>{event.description}</Text>
          ) : null}
        </View>

        {/* Weather Widget */}
        {weather && weatherInfo ? (
          <View style={styles.weatherCard}>
            <Text style={styles.sectionTitle}>Weather Forecast</Text>
            <View style={styles.weatherContent}>
              <Text style={styles.weatherEmoji}>{weatherInfo.emoji}</Text>
              <View style={styles.weatherDetails}>
                <Text style={styles.weatherCondition}>{weatherInfo.label}</Text>
                <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
                <Text style={styles.weatherWind}>💨 Wind: {weather.windspeed} km/h</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.weatherCard}>
            <Text style={styles.sectionTitle}>Weather Forecast</Text>
            <Text style={styles.noDataText}>Weather data unavailable for this event.</Text>
          </View>
        )}

        {/* Setup Sheets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Setup Sheets ({setups.length})</Text>
          {setups.length === 0 ? (
            <Text style={styles.noDataText}>No setup sheets recorded for this event.</Text>
          ) : (
            setups.map((setup) => (
              <View key={setup.id} style={styles.setupCard}>
                <Text style={styles.setupTitle}>
                  Setup — {new Date(setup.createdAt).toLocaleDateString()}
                </Text>
                {setup.notes ? (
                  <Text style={styles.setupNotes}>{setup.notes}</Text>
                ) : null}
                {(setup.tyrePressureFl ||
                  setup.tyrePressureFr ||
                  setup.tyrePressureRl ||
                  setup.tyrePressureRr) ? (
                  <View style={styles.tyreGrid}>
                    <Text style={styles.tyreLabel}>Tyre Pressures (PSI)</Text>
                    <View style={styles.tyreRow}>
                      <TyrePressure label="FL" value={setup.tyrePressureFl} />
                      <TyrePressure label="FR" value={setup.tyrePressureFr} />
                    </View>
                    <View style={styles.tyreRow}>
                      <TyrePressure label="RL" value={setup.tyrePressureRl} />
                      <TyrePressure label="RR" value={setup.tyrePressureRr} />
                    </View>
                  </View>
                ) : null}
                {(setup.rideHeightFront || setup.rideHeightRear) ? (
                  <View style={styles.rideHeightRow}>
                    <Text style={styles.tyreLabel}>Ride Height (mm)</Text>
                    <View style={styles.tyreRow}>
                      <TyrePressure label="Front" value={setup.rideHeightFront} />
                      <TyrePressure label="Rear" value={setup.rideHeightRear} />
                    </View>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const TyrePressure = ({ label, value }: { label: string; value?: number }) => (
  <View style={styles.tyreCell}>
    <Text style={styles.tyreCellLabel}>{label}</Text>
    <Text style={styles.tyreCellValue}>{value != null ? value : '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  centered: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  scroll: { padding: 16, gap: 16 },
  backRow: { marginBottom: 4 },
  backLink: { color: '#E11D48', fontSize: 14, fontWeight: '600' },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC' },
  heroVenue: { fontSize: 14, color: '#94A3B8' },
  heroDate: { fontSize: 14, color: '#64748B' },
  heroDescription: { fontSize: 13, color: '#475569', lineHeight: 20, marginTop: 4 },
  weatherCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  weatherEmoji: { fontSize: 48 },
  weatherDetails: { gap: 4 },
  weatherCondition: { fontSize: 16, fontWeight: '700', color: '#F1F5F9' },
  weatherTemp: { fontSize: 28, fontWeight: '800', color: '#E11D48' },
  weatherWind: { fontSize: 13, color: '#94A3B8' },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#CBD5E1' },
  noDataText: { fontSize: 13, color: '#475569', fontStyle: 'italic' },
  setupCard: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  setupTitle: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  setupNotes: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  tyreGrid: { gap: 6 },
  tyreLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  tyreRow: { flexDirection: 'row', gap: 8 },
  tyreCell: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  tyreCellLabel: { fontSize: 10, color: '#64748B', fontWeight: '700' },
  tyreCellValue: { fontSize: 16, fontWeight: '800', color: '#F1F5F9', marginTop: 2 },
  rideHeightRow: { gap: 6 },
  errorText: { color: '#EF4444', fontSize: 15, textAlign: 'center' },
  backButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  backButtonText: { color: '#CBD5E1', fontWeight: '600' },
});

export default EventDetailScreen;
