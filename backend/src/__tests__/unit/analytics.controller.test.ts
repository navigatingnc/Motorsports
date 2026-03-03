/**
 * Unit tests for the Analytics Controller
 * Prisma is fully mocked — no real database connection is required.
 */
import { Request, Response } from 'express';
import { prismaMock } from '../../__mocks__/prisma';
import {
  recordLapTime,
  getLapTimes,
  getLapTimeById,
  updateLapTime,
  deleteLapTime,
  msToLapTimeString,
} from '../../controllers/analytics.controller';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockReq(
  body: Record<string, unknown> = {},
  params: Record<string, string> = {},
  query: Record<string, string> = {},
): Partial<Request> {
  return { body, params, query } as Partial<Request>;
}

function mockRes(): { res: Partial<Response>; json: jest.Mock; status: jest.Mock } {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnThis();
  (status as jest.Mock).mockImplementation(() => ({ json }));
  const res = { json, status } as Partial<Response>;
  return { res, json, status };
}

const sampleDriver = {
  id: 'driver-uuid-1',
  userId: 'user-uuid-1',
  user: { id: 'user-uuid-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
};

const sampleVehicle = {
  id: 'vehicle-uuid-1',
  make: 'Ferrari',
  model: '488 GT3',
  year: 2023,
  number: '88',
  category: 'GT',
};

const sampleEvent = {
  id: 'event-uuid-1',
  name: 'Silverstone Round 1',
  type: 'Race',
  venue: 'Silverstone Circuit',
  location: 'UK',
  startDate: new Date('2026-06-01'),
};

const sampleLapTime = {
  id: 'laptime-uuid-1',
  driverId: sampleDriver.id,
  vehicleId: sampleVehicle.id,
  eventId: sampleEvent.id,
  lapNumber: 1,
  lapTimeMs: 92500,
  sessionType: 'Race',
  sector1Ms: 30000,
  sector2Ms: 31000,
  sector3Ms: 31500,
  isValid: true,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  driver: sampleDriver,
  vehicle: sampleVehicle,
  event: sampleEvent,
};

// ─── msToLapTimeString ───────────────────────────────────────────────────────

describe('msToLapTimeString', () => {
  it('converts 0 ms to 00:00.000', () => {
    expect(msToLapTimeString(0)).toBe('00:00.000');
  });

  it('converts 92500 ms to 01:32.500', () => {
    expect(msToLapTimeString(92500)).toBe('01:32.500');
  });

  it('converts 60000 ms to 01:00.000', () => {
    expect(msToLapTimeString(60000)).toBe('01:00.000');
  });

  it('converts 3723456 ms correctly (62 minutes)', () => {
    expect(msToLapTimeString(3723456)).toBe('62:03.456');
  });
});

// ─── recordLapTime ───────────────────────────────────────────────────────────

describe('AnalyticsController.recordLapTime', () => {
  const validBody = {
    driverId: sampleDriver.id,
    vehicleId: sampleVehicle.id,
    eventId: sampleEvent.id,
    lapNumber: 1,
    lapTimeMs: 92500,
    sessionType: 'Race',
  };

  it('returns 400 when required relation IDs are missing', async () => {
    const req = mockReq({ lapNumber: 1, lapTimeMs: 92500, sessionType: 'Race' });
    const { res, status, json } = mockRes();

    await recordLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 when lapNumber is less than 1', async () => {
    const req = mockReq({ ...validBody, lapNumber: 0 });
    const { res, status, json } = mockRes();

    await recordLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'lapNumber must be a positive integer' }),
    );
  });

  it('returns 400 when lapTimeMs is zero or negative', async () => {
    const req = mockReq({ ...validBody, lapTimeMs: -100 });
    const { res, status, json } = mockRes();

    await recordLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'lapTimeMs must be a positive integer (milliseconds)' }),
    );
  });

  it('returns 400 for an invalid sessionType', async () => {
    const req = mockReq({ ...validBody, sessionType: 'Sprint' });
    const { res, status, json } = mockRes();

    await recordLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 404 when the driver does not exist', async () => {
    prismaMock.driver.findUnique.mockResolvedValue(null);

    const req = mockReq(validBody);
    const { res, status, json } = mockRes();

    await recordLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Driver not found' }));
  });

  it('returns 404 when the vehicle does not exist', async () => {
    prismaMock.driver.findUnique.mockResolvedValue({ id: sampleDriver.id } as any);
    prismaMock.vehicle.findUnique.mockResolvedValue(null);

    const req = mockReq(validBody);
    const { res, status, json } = mockRes();

    await recordLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Vehicle not found' }));
  });

  it('returns 404 when the event does not exist', async () => {
    prismaMock.driver.findUnique.mockResolvedValue({ id: sampleDriver.id } as any);
    prismaMock.vehicle.findUnique.mockResolvedValue({ id: sampleVehicle.id } as any);
    prismaMock.event.findUnique.mockResolvedValue(null);

    const req = mockReq(validBody);
    const { res, status, json } = mockRes();

    await recordLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Event not found' }));
  });

  it('returns 201 with the recorded lap time on success', async () => {
    prismaMock.driver.findUnique.mockResolvedValue({ id: sampleDriver.id } as any);
    prismaMock.vehicle.findUnique.mockResolvedValue({ id: sampleVehicle.id } as any);
    prismaMock.event.findUnique.mockResolvedValue({ id: sampleEvent.id } as any);
    prismaMock.lapTime.create.mockResolvedValue(sampleLapTime as any);

    const req = mockReq(validBody);
    const { res, status, json } = mockRes();

    await recordLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.lapTimeFormatted).toBe('01:32.500');
  });
});

// ─── getLapTimes ─────────────────────────────────────────────────────────────

describe('AnalyticsController.getLapTimes', () => {
  it('returns 200 with an array of lap times', async () => {
    prismaMock.lapTime.findMany.mockResolvedValue([sampleLapTime] as any);

    const req = mockReq();
    const { res, json } = mockRes();

    await getLapTimes(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data).toHaveLength(1);
    expect(call.data[0].lapTimeFormatted).toBe('01:32.500');
  });

  it('returns 200 with empty array when no lap times exist', async () => {
    prismaMock.lapTime.findMany.mockResolvedValue([]);

    const req = mockReq();
    const { res, json } = mockRes();

    await getLapTimes(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data).toHaveLength(0);
  });
});

// ─── getLapTimeById ──────────────────────────────────────────────────────────

describe('AnalyticsController.getLapTimeById', () => {
  it('returns 200 with the lap time when found', async () => {
    prismaMock.lapTime.findUnique.mockResolvedValue(sampleLapTime as any);

    const req = mockReq({}, { id: sampleLapTime.id });
    const { res, json } = mockRes();

    await getLapTimeById(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.id).toBe(sampleLapTime.id);
  });

  it('returns 404 when the lap time does not exist', async () => {
    prismaMock.lapTime.findUnique.mockResolvedValue(null);

    const req = mockReq({}, { id: 'nonexistent-id' });
    const { res, status, json } = mockRes();

    await getLapTimeById(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Lap time not found' }));
  });
});

// ─── updateLapTime ───────────────────────────────────────────────────────────

describe('AnalyticsController.updateLapTime', () => {
  it('returns 404 when the lap time does not exist', async () => {
    prismaMock.lapTime.findUnique.mockResolvedValue(null);

    const req = mockReq({ lapTimeMs: 90000 }, { id: 'ghost-id' });
    const { res, status, json } = mockRes();

    await updateLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Lap time not found' }));
  });

  it('returns 400 for an invalid sessionType on update', async () => {
    prismaMock.lapTime.findUnique.mockResolvedValue(sampleLapTime as any);

    const req = mockReq({ sessionType: 'InvalidType' }, { id: sampleLapTime.id });
    const { res, status, json } = mockRes();

    await updateLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 200 with updated lap time on success', async () => {
    prismaMock.lapTime.findUnique.mockResolvedValue(sampleLapTime as any);
    prismaMock.lapTime.update.mockResolvedValue({ ...sampleLapTime, lapTimeMs: 90000 } as any);

    const req = mockReq({ lapTimeMs: 90000 }, { id: sampleLapTime.id });
    const { res, json } = mockRes();

    await updateLapTime(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.lapTimeMs).toBe(90000);
  });
});

// ─── deleteLapTime ───────────────────────────────────────────────────────────

describe('AnalyticsController.deleteLapTime', () => {
  it('returns 404 when the lap time does not exist', async () => {
    prismaMock.lapTime.findUnique.mockResolvedValue(null);

    const req = mockReq({}, { id: 'ghost-id' });
    const { res, status, json } = mockRes();

    await deleteLapTime(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Lap time not found' }));
  });

  it('returns 200 with success message on deletion', async () => {
    prismaMock.lapTime.findUnique.mockResolvedValue(sampleLapTime as any);
    prismaMock.lapTime.delete.mockResolvedValue(sampleLapTime as any);

    const req = mockReq({}, { id: sampleLapTime.id });
    const { res, json } = mockRes();

    await deleteLapTime(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.message).toBe('Lap time deleted successfully');
  });
});
