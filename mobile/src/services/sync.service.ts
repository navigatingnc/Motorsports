import * as SecureStore from 'expo-secure-store';
import { LapTimeCreateDto } from '../types/laptime.types';
import { recordLapTime } from './laptime.service';

const SYNC_QUEUE_KEY = 'offline_laptime_queue';

/**
 * Add a lap time to the offline sync queue.
 */
export const queueLapTime = async (dto: LapTimeCreateDto): Promise<void> => {
  try {
    const existingQueueStr = await SecureStore.getItemAsync(SYNC_QUEUE_KEY);
    const queue: LapTimeCreateDto[] = existingQueueStr ? JSON.parse(existingQueueStr) : [];
    queue.push(dto);
    await SecureStore.setItemAsync(SYNC_QUEUE_KEY, JSON.stringify(queue));
    console.log(`Queued lap time. Queue length: ${queue.length}`);
  } catch (error) {
    console.error('Error queuing lap time:', error);
  }
};

/**
 * Attempt to sync all queued lap times to the backend.
 */
export const syncQueuedData = async (): Promise<void> => {
  try {
    const existingQueueStr = await SecureStore.getItemAsync(SYNC_QUEUE_KEY);
    if (!existingQueueStr) return;

    const queue: LapTimeCreateDto[] = JSON.parse(existingQueueStr);
    if (queue.length === 0) return;

    console.log(`Attempting to sync ${queue.length} items...`);
    const remainingQueue: LapTimeCreateDto[] = [];

    for (const dto of queue) {
      try {
        await recordLapTime(dto);
      } catch (error) {
        console.error('Failed to sync item, keeping in queue', error);
        remainingQueue.push(dto);
      }
    }

    await SecureStore.setItemAsync(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
    console.log(`Sync complete. Remaining in queue: ${remainingQueue.length}`);
  } catch (error) {
    console.error('Error during sync process:', error);
  }
};
