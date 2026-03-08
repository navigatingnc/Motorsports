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
import { Vehicle, LapTimeSummary } from '../types/vehicle.types';
import { getVehicle, getVehicleLapTimes, formatLapTime } from '../services/vehicle.service';

type Props = NativeStackScreenProps<AppStackParamList, 'VehicleDetail'>;

/**
 * VehicleDetailScreen shows full vehicle specifications, a performance
 * summary (best lap, total laps), and a complete lap time history table.
 */
const VehicleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { vehicleId } = route.params;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [lapTimes, setLapTimes] = useState<LapTimeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [vehicleData, lapData] = await Promise.all([
        getVehicle(vehicleId),
        getVehicleLapTimes(vehicleId),
      ]);
      setVehicle(vehicleData);
      setLapTimes(lapData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load vehicle details.';
      setError(message);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const bestLap = lapTimes.length > 0 ? Math.min(...lapTimes.map((l) => l.timeMs)) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#E11D48" />
      </SafeAreaView>
    );
  }

  if (error || !vehicle) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Vehicle not found.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.backLink}>← Vehicles</Text>
        </TouchableOpacity>

        {/* Vehicle Header */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text style={styles.heroYear}>{vehicle.year}</Text>
          {vehicle.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{vehicle.category.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>

        {/* Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specGrid}>
            <SpecRow label="Make" value={vehicle.make} />
            <SpecRow label="Model" value={vehicle.model} />
            <SpecRow label="Year" value={String(vehicle.year)} />
            <SpecRow label="Category" value={vehicle.category ?? '—'} />
            {vehicle.color ? <SpecRow label="Color" value={vehicle.color} /> : null}
            {vehicle.vin ? <SpecRow label="VIN" value={vehicle.vin} /> : null}
          </View>
          {vehicle.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{vehicle.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Performance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.statsRow}>
            <StatCard label="Total Laps" value={String(lapTimes.length)} />
            <StatCard
              label="Best Lap"
              value={bestLap !== null ? formatLapTime(bestLap) : '—'}
              highlight
            />
          </View>
        </View>

        {/* Lap Time History */}
        {lapTimes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lap Time History</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeading, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.tableCell, styles.tableHeading, { flex: 1 }]}>Time</Text>
              <Text style={[styles.tableCell, styles.tableHeading, { flex: 1.5 }]}>Event</Text>
            </View>
            {lapTimes.map((lap) => (
              <View
                key={lap.id}
                style={[
                  styles.tableRow,
                  lap.timeMs === bestLap && styles.tableRowBest,
                ]}
              >
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{lap.lapNumber}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1 },
                    lap.timeMs === bestLap && styles.tableCellBest,
                  ]}
                >
                  {formatLapTime(lap.timeMs)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]} numberOfLines={1}>
                  {lap.eventName ?? lap.eventId.slice(0, 8)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.specRow}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

const StatCard = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
    <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
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
    gap: 6,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  heroYear: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E11D48',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: '#FFF', letterSpacing: 0.5 },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#CBD5E1', marginBottom: 4 },
  specGrid: { gap: 8 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  specLabel: { fontSize: 13, color: '#64748B' },
  specValue: { fontSize: 13, color: '#E2E8F0', fontWeight: '600' },
  notesBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  notesLabel: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  notesText: { fontSize: 13, color: '#94A3B8', lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statCardHighlight: { borderColor: '#E11D48' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#F1F5F9' },
  statValueHighlight: { color: '#E11D48' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 4 },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tableHeading: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  tableRowBest: { backgroundColor: 'rgba(225, 29, 72, 0.08)', borderRadius: 6 },
  tableCell: { fontSize: 13, color: '#CBD5E1' },
  tableCellBest: { color: '#E11D48', fontWeight: '700' },
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

export default VehicleDetailScreen;
