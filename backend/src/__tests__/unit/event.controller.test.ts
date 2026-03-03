/**
 * Unit tests for the Event Controller
 * Prisma is fully mocked — no real database connection is required.
 */
import { Request, Response } from 'express';
import { prismaMock } from '../../__mocks__/prisma';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../controllers/event.controller';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockReq(
  body: Record<string, unknown> = {},
  params: Record<string, string> = {},
): Partial<Request> {
  return { body, params } as Partial<Request>;
}

function mockRes(): { res: Partial<Response>; json: jest.Mock; status: jest.Mock } {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnThis();
  (status as jest.Mock).mockImplementation(() => ({ json }));
  const res = { json, status } as Partial<Response>;
  return { res, json, status };
}

const sampleEvent = {
  id: 'event-uuid-1',
  name: 'Silverstone Round 1',
  type: 'Race',
  venue: 'Silverstone Circuit',
  location: 'Northamptonshire, UK',
  startDate: new Date('2026-06-01T09:00:00Z'),
  endDate: new Date('2026-06-01T17:00:00Z'),
  status: 'Upcoming',
  description: null,
  notes: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// ─── getAllEvents ────────────────────────────────────────────────────────────

describe('EventController.getAllEvents', () => {
  it('returns 200 with an array of events', async () => {
    prismaMock.event.findMany.mockResolvedValue([sampleEvent] as any);

    const req = mockReq();
    const { res, json } = mockRes();

    await getAllEvents(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data).toHaveLength(1);
    expect(call.count).toBe(1);
  });

  it('returns 200 with empty array when no events exist', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    const req = mockReq();
    const { res, json } = mockRes();

    await getAllEvents(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data).toHaveLength(0);
  });

  it('returns 500 when Prisma throws an error', async () => {
    prismaMock.event.findMany.mockRejectedValue(new Error('DB connection failed'));

    const req = mockReq();
    const { res, status, json } = mockRes();

    await getAllEvents(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

// ─── getEventById ────────────────────────────────────────────────────────────

describe('EventController.getEventById', () => {
  it('returns 200 with the event when found', async () => {
    prismaMock.event.findUnique.mockResolvedValue(sampleEvent as any);

    const req = mockReq({}, { id: sampleEvent.id });
    const { res, json } = mockRes();

    await getEventById(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.id).toBe(sampleEvent.id);
  });

  it('returns 404 when the event does not exist', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);

    const req = mockReq({}, { id: 'nonexistent-id' });
    const { res, status, json } = mockRes();

    await getEventById(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Event not found' }));
  });
});

// ─── createEvent ─────────────────────────────────────────────────────────────

describe('EventController.createEvent', () => {
  const validBody = {
    name: 'Silverstone Round 1',
    type: 'Race',
    venue: 'Silverstone Circuit',
    location: 'Northamptonshire, UK',
    startDate: '2026-06-01T09:00:00Z',
    endDate: '2026-06-01T17:00:00Z',
  };

  it('returns 400 when required fields are missing', async () => {
    const req = mockReq({ name: 'Test Event' });
    const { res, status, json } = mockRes();

    await createEvent(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 for an invalid startDate format', async () => {
    const req = mockReq({ ...validBody, startDate: 'not-a-date' });
    const { res, status, json } = mockRes();

    await createEvent(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Invalid startDate') }),
    );
  });

  it('returns 400 when endDate is before startDate', async () => {
    const req = mockReq({
      ...validBody,
      startDate: '2026-06-02T09:00:00Z',
      endDate: '2026-06-01T17:00:00Z',
    });
    const { res, status, json } = mockRes();

    await createEvent(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'endDate must be on or after startDate' }),
    );
  });

  it('returns 400 for an invalid status value', async () => {
    const req = mockReq({ ...validBody, status: 'Postponed' });
    const { res, status, json } = mockRes();

    await createEvent(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 201 with the created event on success', async () => {
    prismaMock.event.create.mockResolvedValue(sampleEvent as any);

    const req = mockReq(validBody);
    const { res, status, json } = mockRes();

    await createEvent(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.name).toBe('Silverstone Round 1');
  });
});

// ─── updateEvent ─────────────────────────────────────────────────────────────

describe('EventController.updateEvent', () => {
  it('returns 404 when the event does not exist', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);

    const req = mockReq({ name: 'New Name' }, { id: 'ghost-id' });
    const { res, status, json } = mockRes();

    await updateEvent(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Event not found' }));
  });

  it('returns 200 with the updated event on success', async () => {
    prismaMock.event.findUnique.mockResolvedValue(sampleEvent as any);
    prismaMock.event.update.mockResolvedValue({ ...sampleEvent, name: 'Updated Name' } as any);

    const req = mockReq({ name: 'Updated Name' }, { id: sampleEvent.id });
    const { res, json } = mockRes();

    await updateEvent(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.name).toBe('Updated Name');
  });
});

// ─── deleteEvent ─────────────────────────────────────────────────────────────

describe('EventController.deleteEvent', () => {
  it('returns 404 when the event does not exist', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);

    const req = mockReq({}, { id: 'ghost-id' });
    const { res, status, json } = mockRes();

    await deleteEvent(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Event not found' }));
  });

  it('returns 200 with success message on deletion', async () => {
    prismaMock.event.findUnique.mockResolvedValue(sampleEvent as any);
    prismaMock.event.delete.mockResolvedValue(sampleEvent as any);

    const req = mockReq({}, { id: sampleEvent.id });
    const { res, json } = mockRes();

    await deleteEvent(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.message).toBe('Event deleted successfully');
  });
});
