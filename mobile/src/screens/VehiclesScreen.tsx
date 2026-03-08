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
import { Vehicle } from '../types/vehicle.types';
import { getVehicles } from '../services/vehicle.service';

type Props = NativeStackScreenProps<AppStackParamList, 'Vehicles'>;

/**
 * VehiclesScreen displays a list of all registered vehicles.
 * Supports pull-to-refresh and navigates to VehicleDetailScreen on tap.
 */
const VehiclesScreen: React.FC<Props> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setError(null);
      const data = await getVehicles();
      setVehicles(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load vehicles.';
      setError(message);
    }
  }, []);

  useEffect(() => {
    fetchVehicles().finally(() => setLoading(false));
  }, [fetchVehicles]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVehicles();
    setRefreshing(false);
  }, [fetchVehicles]);

  const getCategoryColor = (category: string): string => {
    const map: Record<string, string> = {
      sedan: '#3B82F6',
      suv: '#10B981',
      truck: '#F59E0B',
      sports: '#E11D48',
      motorcycle: '#8B5CF6',
    };
    return map[category?.toLowerCase()] ?? '#64748B';
  };

  const renderItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item.id })}
      activeOpacity={0.75}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category?.toUpperCase() ?? 'N/A'}</Text>
        </View>
        <Text style={styles.year}>{item.year}</Text>
      </View>
      <Text style={styles.vehicleName}>
        {item.make} {item.model}
      </Text>
      {item.color ? <Text style={styles.vehicleMeta}>Color: {item.color}</Text> : null}
      {item.vin ? (
        <Text style={styles.vehicleMeta} numberOfLines={1}>
          VIN: {item.vin}
        </Text>
      ) : null}
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
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
        <Text style={styles.headerTitle}>🚗 Vehicles</Text>
        <Text style={styles.headerSubtitle}>{vehicles.length} registered</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchVehicles} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={vehicles}
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
              <Text style={styles.emptyText}>No vehicles found.</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  year: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  vehicleMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
  },
  chevronText: {
    fontSize: 24,
    color: '#475569',
  },
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
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E11D48',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#475569',
    fontSize: 13,
  },
});

export default VehiclesScreen;
