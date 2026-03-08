import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { Vehicle } from '../types/vehicle.types';
import { RaceEvent } from '../types/event.types';
import { getVehicles } from '../services/vehicle.service';
import { getEvents } from '../services/event.service';
import { recordLapTime, formatLapTime } from '../services/laptime.service';

type Props = NativeStackScreenProps<AppStackParamList, 'RecordLapTime'>;

interface SplitEntry {
  lapNumber: number;
  timeMs: number;
}

/**
 * RecordLapTimeScreen provides a live stopwatch for recording lap times.
 * The user selects an event and vehicle, then uses Start/Lap/Stop controls
 * to capture lap times which are immediately submitted to the backend.
 */
const RecordLapTimeScreen: React.FC<Props> = () => {
  // Selection state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<RaceEvent | null>(null);
  const [loadingSelections, setLoadingSelections] = useState(true);

  // Stopwatch state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lapStartMs, setLapStartMs] = useState(0);
  const [lapElapsedMs, setLapElapsedMs] = useState(0);
  const [splits, setSplits] = useState<SplitEntry[]>([]);
  const [lapCount, setLapCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const lapStartTimeRef = useRef<number>(0);

  // Load vehicles and events for selection
  useEffect(() => {
    Promise.all([getVehicles(), getEvents()])
      .then(([v, e]) => {
        setVehicles(v);
        setEvents(e);
        if (v.length > 0) setSelectedVehicle(v[0]);
        if (e.length > 0) setSelectedEvent(e[0]);
      })
      .catch(() => {
        // Non-fatal: user can still use stopwatch without selection
      })
      .finally(() => setLoadingSelections(false));
  }, []);

  // Tick the stopwatch every 10ms for smooth display
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedMs(now - startTimeRef.current);
        setLapElapsedMs(now - lapStartTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now - elapsedMs;
    lapStartTimeRef.current = now - lapElapsedMs;
    setIsRunning(true);
  }, [elapsedMs, lapElapsedMs]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setElapsedMs(0);
    setLapElapsedMs(0);
    setLapCount(0);
    setSplits([]);
  }, []);

  const handleLap = useCallback(async () => {
    if (!isRunning) return;

    const now = Date.now();
    const currentLapMs = now - lapStartTimeRef.current;
    const newLapNumber = lapCount + 1;

    // Record split locally immediately
    const newSplit: SplitEntry = { lapNumber: newLapNumber, timeMs: currentLapMs };
    setSplits((prev) => [newSplit, ...prev]);
    setLapCount(newLapNumber);

    // Reset lap timer
    lapStartTimeRef.current = now;
    setLapElapsedMs(0);

    // Submit to backend if event and vehicle are selected
    if (selectedEvent && selectedVehicle) {
      setSaving(true);
      try {
        await recordLapTime({
          lapNumber: newLapNumber,
          timeMs: currentLapMs,
          eventId: selectedEvent.id,
          vehicleId: selectedVehicle.id,
        });
      } catch {
        // Non-fatal: lap is still recorded locally
      } finally {
        setSaving(false);
      }
    }
  }, [isRunning, lapCount, selectedEvent, selectedVehicle]);

  const handleFinish = useCallback(async () => {
    if (!isRunning) return;

    const now = Date.now();
    const finalLapMs = now - lapStartTimeRef.current;
    const finalLapNumber = lapCount + 1;

    setIsRunning(false);

    const finalSplit: SplitEntry = { lapNumber: finalLapNumber, timeMs: finalLapMs };
    setSplits((prev) => [finalSplit, ...prev]);
    setLapCount(finalLapNumber);

    if (selectedEvent && selectedVehicle) {
      setSaving(true);
      try {
        await recordLapTime({
          lapNumber: finalLapNumber,
          timeMs: finalLapMs,
          eventId: selectedEvent.id,
          vehicleId: selectedVehicle.id,
        });
        Alert.alert(
          'Session Complete',
          `${finalLapNumber} lap${finalLapNumber !== 1 ? 's' : ''} recorded for ${selectedVehicle.make} ${selectedVehicle.model}.`,
          [{ text: 'OK' }]
        );
      } catch {
        Alert.alert('Save Failed', 'Lap times were recorded locally but could not be saved to the server.', [{ text: 'OK' }]);
      } finally {
        setSaving(false);
      }
    }
  }, [isRunning, lapCount, selectedEvent, selectedVehicle]);

  const bestSplit = splits.length > 0 ? Math.min(...splits.map((s) => s.timeMs)) : null;

  if (loadingSelections) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#E11D48" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⏱ Lap Timer</Text>
        </View>

        {/* Selection */}
        <View style={styles.selectionCard}>
          <Text style={styles.selectionLabel}>Event</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {events.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={[styles.chip, selectedEvent?.id === e.id && styles.chipActive]}
                onPress={() => !isRunning && setSelectedEvent(e)}
                disabled={isRunning}
              >
                <Text
                  style={[styles.chipText, selectedEvent?.id === e.id && styles.chipTextActive]}
                  numberOfLines={1}
                >
                  {e.name}
                </Text>
              </TouchableOpacity>
            ))}
            {events.length === 0 && (
              <Text style={styles.noDataText}>No events available</Text>
            )}
          </ScrollView>

          <Text style={[styles.selectionLabel, { marginTop: 12 }]}>Vehicle</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {vehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.chip, selectedVehicle?.id === v.id && styles.chipActive]}
                onPress={() => !isRunning && setSelectedVehicle(v)}
                disabled={isRunning}
              >
                <Text
                  style={[styles.chipText, selectedVehicle?.id === v.id && styles.chipTextActive]}
                  numberOfLines={1}
                >
                  {v.make} {v.model}
                </Text>
              </TouchableOpacity>
            ))}
            {vehicles.length === 0 && (
              <Text style={styles.noDataText}>No vehicles available</Text>
            )}
          </ScrollView>
        </View>

        {/* Stopwatch Display */}
        <View style={styles.stopwatchCard}>
          {/* Total elapsed */}
          <Text style={styles.totalTime}>{formatLapTime(elapsedMs)}</Text>
          <Text style={styles.totalLabel}>Total Time</Text>

          {/* Current lap */}
          <View style={styles.lapDisplay}>
            <Text style={styles.lapLabel}>Lap {lapCount + 1}</Text>
            <Text style={styles.lapTime}>{formatLapTime(lapElapsedMs)}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {!isRunning ? (
              <>
                <TouchableOpacity
                  style={[styles.controlBtn, styles.btnStart]}
                  onPress={handleStart}
                  activeOpacity={0.8}
                >
                  <Text style={styles.controlBtnText}>{elapsedMs > 0 ? 'Resume' : 'Start'}</Text>
                </TouchableOpacity>
                {elapsedMs > 0 && (
                  <TouchableOpacity
                    style={[styles.controlBtn, styles.btnReset]}
                    onPress={handleReset}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.controlBtnText}>Reset</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.controlBtn, styles.btnLap]}
                  onPress={handleLap}
                  activeOpacity={0.8}
                >
                  <Text style={styles.controlBtnText}>Lap</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlBtn, styles.btnStop]}
                  onPress={handleStop}
                  activeOpacity={0.8}
                >
                  <Text style={styles.controlBtnText}>Stop</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlBtn, styles.btnFinish]}
                  onPress={handleFinish}
                  activeOpacity={0.8}
                >
                  <Text style={styles.controlBtnText}>Finish</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {saving && (
            <View style={styles.savingRow}>
              <ActivityIndicator size="small" color="#E11D48" />
              <Text style={styles.savingText}>Saving lap...</Text>
            </View>
          )}
        </View>

        {/* Splits Table */}
        {splits.length > 0 && (
          <View style={styles.splitsCard}>
            <Text style={styles.splitsTitle}>Splits</Text>
            <View style={styles.splitsHeader}>
              <Text style={[styles.splitCell, styles.splitHeading, { flex: 0.5 }]}>Lap</Text>
              <Text style={[styles.splitCell, styles.splitHeading, { flex: 1 }]}>Time</Text>
              <Text style={[styles.splitCell, styles.splitHeading, { flex: 1 }]}>Diff</Text>
            </View>
            {splits.map((split) => {
              const isBest = split.timeMs === bestSplit;
              const diff =
                bestSplit !== null && !isBest
                  ? `+${formatLapTime(split.timeMs - bestSplit!)}`
                  : isBest
                  ? 'BEST'
                  : '—';
              return (
                <View
                  key={split.lapNumber}
                  style={[styles.splitRow, isBest && styles.splitRowBest]}
                >
                  <Text style={[styles.splitCell, { flex: 0.5 }]}>{split.lapNumber}</Text>
                  <Text
                    style={[styles.splitCell, { flex: 1 }, isBest && styles.splitCellBest]}
                  >
                    {formatLapTime(split.timeMs)}
                  </Text>
                  <Text
                    style={[
                      styles.splitCell,
                      { flex: 1 },
                      isBest ? styles.splitCellBest : styles.splitCellDiff,
                    ]}
                  >
                    {diff}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  scroll: { padding: 16, gap: 16 },
  header: {
    paddingVertical: 8,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#F8FAFC' },
  selectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8, letterSpacing: 0.5 },
  chipScroll: { flexDirection: 'row' },
  chip: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
    maxWidth: 160,
  },
  chipActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  chipText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  noDataText: { fontSize: 13, color: '#475569', fontStyle: 'italic', paddingVertical: 8 },
  stopwatchCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 8,
  },
  totalTime: {
    fontSize: 56,
    fontWeight: '800',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  totalLabel: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  lapDisplay: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  lapLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  lapTime: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E11D48',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  controlBtn: {
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    minWidth: 90,
    alignItems: 'center',
  },
  btnStart: { backgroundColor: '#10B981' },
  btnStop: { backgroundColor: '#F59E0B' },
  btnReset: { backgroundColor: '#475569' },
  btnLap: { backgroundColor: '#3B82F6' },
  btnFinish: { backgroundColor: '#E11D48' },
  controlBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  savingText: { color: '#64748B', fontSize: 12 },
  splitsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  splitsTitle: { fontSize: 16, fontWeight: '700', color: '#CBD5E1', marginBottom: 4 },
  splitsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  splitHeading: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  splitRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  splitRowBest: { backgroundColor: 'rgba(225, 29, 72, 0.08)', borderRadius: 6 },
  splitCell: { fontSize: 13, color: '#CBD5E1' },
  splitCellBest: { color: '#E11D48', fontWeight: '700' },
  splitCellDiff: { color: '#F59E0B' },
});

export default RecordLapTimeScreen;
