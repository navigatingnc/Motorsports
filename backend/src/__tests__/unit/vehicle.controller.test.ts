/**
 * Unit tests for the Vehicle Controller
 * Prisma is fully mocked — no real database connection is required.
 */
import { Request, Response } from 'express';
import { prismaMock } from '../../__mocks__/prisma';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../../controllers/vehicle.controller';

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

const sampleVehicle = {
  id: 'vehicle-uuid-1',
  make: 'Ferrari',
  model: '488 GT3',
  year: 2023,
  category: 'GT',
  number: '88',
  vin: null,
  notes: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// ─── getAllVehicles ──────────────────────────────────────────────────────────

describe('VehicleController.getAllVehicles', () => {
  it('returns 200 with an array of vehicles', async () => {
    prismaMock.vehicle.findMany.mockResolvedValue([sampleVehicle] as any);

    const req = mockReq();
    const { res, json } = mockRes();

    await getAllVehicles(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data).toHaveLength(1);
    expect(call.count).toBe(1);
  });

  it('returns 200 with an empty array when no vehicles exist', async () => {
    prismaMock.vehicle.findMany.mockResolvedValue([]);

    const req = mockReq();
    const { res, json } = mockRes();

    await getAllVehicles(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data).toHaveLength(0);
  });

  it('returns 500 when Prisma throws an error', async () => {
    prismaMock.vehicle.findMany.mockRejectedValue(new Error('DB error'));

    const req = mockReq();
    const { res, status, json } = mockRes();

    await getAllVehicles(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

// ─── getVehicleById ──────────────────────────────────────────────────────────

describe('VehicleController.getVehicleById', () => {
  it('returns 200 with the vehicle when found', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(sampleVehicle as any);

    const req = mockReq({}, { id: sampleVehicle.id });
    const { res, json } = mockRes();

    await getVehicleById(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.id).toBe(sampleVehicle.id);
  });

  it('returns 404 when the vehicle does not exist', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(null);

    const req = mockReq({}, { id: 'nonexistent-id' });
    const { res, status, json } = mockRes();

    await getVehicleById(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Vehicle not found' }));
  });
});

// ─── createVehicle ───────────────────────────────────────────────────────────

describe('VehicleController.createVehicle', () => {
  const validBody = { make: 'Ferrari', model: '488 GT3', year: 2023, category: 'GT' };

  it('returns 400 when required fields are missing', async () => {
    const req = mockReq({ make: 'Ferrari' });
    const { res, status, json } = mockRes();

    await createVehicle(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 for an invalid year (too old)', async () => {
    const req = mockReq({ ...validBody, year: 1800 });
    const { res, status, json } = mockRes();

    await createVehicle(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid year' }));
  });

  it('returns 400 for an invalid year (future)', async () => {
    const req = mockReq({ ...validBody, year: new Date().getFullYear() + 5 });
    const { res, status, json } = mockRes();

    await createVehicle(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid year' }));
  });

  it('returns 409 when a duplicate VIN is detected', async () => {
    const error: any = new Error('Unique constraint failed');
    error.code = 'P2002';
    error.meta = { target: ['vin'] };
    prismaMock.vehicle.create.mockRejectedValue(error);

    const req = mockReq({ ...validBody, vin: 'DUPLICATE-VIN' });
    const { res, status, json } = mockRes();

    await createVehicle(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'A vehicle with this VIN already exists' }),
    );
  });

  it('returns 201 with the created vehicle on success', async () => {
    prismaMock.vehicle.create.mockResolvedValue(sampleVehicle as any);

    const req = mockReq(validBody);
    const { res, status, json } = mockRes();

    await createVehicle(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.make).toBe('Ferrari');
  });
});

// ─── updateVehicle ───────────────────────────────────────────────────────────

describe('VehicleController.updateVehicle', () => {
  it('returns 404 when the vehicle does not exist', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(null);

    const req = mockReq({ make: 'Lamborghini' }, { id: 'ghost-id' });
    const { res, status, json } = mockRes();

    await updateVehicle(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Vehicle not found' }));
  });

  it('returns 200 with updated vehicle on success', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(sampleVehicle as any);
    prismaMock.vehicle.update.mockResolvedValue({ ...sampleVehicle, make: 'Lamborghini' } as any);

    const req = mockReq({ make: 'Lamborghini' }, { id: sampleVehicle.id });
    const { res, json } = mockRes();

    await updateVehicle(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.make).toBe('Lamborghini');
  });
});

// ─── deleteVehicle ───────────────────────────────────────────────────────────

describe('VehicleController.deleteVehicle', () => {
  it('returns 404 when the vehicle does not exist', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(null);

    const req = mockReq({}, { id: 'ghost-id' });
    const { res, status, json } = mockRes();

    await deleteVehicle(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Vehicle not found' }));
  });

  it('returns 200 with success message on deletion', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(sampleVehicle as any);
    prismaMock.vehicle.delete.mockResolvedValue(sampleVehicle as any);

    const req = mockReq({}, { id: sampleVehicle.id });
    const { res, json } = mockRes();

    await deleteVehicle(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.message).toBe('Vehicle deleted successfully');
  });
});
