/**
 * Integration tests for critical API flows using Supertest.
 * Prisma is fully mocked — no real database connection is required.
 *
 * Covered flows:
 *  1. Health check
 *  2. Register → Login → Get Profile (auth flow)
 *  3. Register → Login → Create Vehicle → Record Lap Time (full workflow)
 *  4. Auth guard enforcement (protected routes without token)
 *  5. Role-based access control (viewer cannot write)
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from '../testApp';
import { prismaMock } from '../../__mocks__/prisma';

const app = createTestApp();
const JWT_SECRET = 'test-jwt-secret-for-unit-tests-only-not-for-production';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const userFixture = {
  id: 'integration-user-id',
  email: 'integration@example.com',
  passwordHash: '', // set in beforeAll
  role: 'user',
  firstName: 'Integration',
  lastName: 'Tester',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const vehicleFixture = {
  id: 'integration-vehicle-id',
  make: 'Porsche',
  model: '911 GT3 Cup',
  year: 2024,
  category: 'GT',
  number: '911',
  vin: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const driverFixture = {
  id: 'integration-driver-id',
  userId: userFixture.id,
  licenseNumber: null,
  nationality: null,
  dateOfBirth: null,
  bio: null,
  emergencyContact: null,
  medicalNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const eventFixture = {
  id: 'integration-event-id',
  name: 'Spa-Francorchamps Round 2',
  type: 'Race',
  venue: 'Circuit de Spa-Francorchamps',
  location: 'Stavelot, Belgium',
  startDate: new Date('2026-07-01T09:00:00Z'),
  endDate: new Date('2026-07-01T18:00:00Z'),
  status: 'Upcoming',
  description: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const lapTimeFixture = {
  id: 'integration-laptime-id',
  driverId: driverFixture.id,
  vehicleId: vehicleFixture.id,
  eventId: eventFixture.id,
  lapNumber: 1,
  lapTimeMs: 134567,
  sessionType: 'Race',
  sector1Ms: 44000,
  sector2Ms: 46000,
  sector3Ms: 44567,
  isValid: true,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  driver: {
    id: driverFixture.id,
    userId: userFixture.id,
    user: {
      id: userFixture.id,
      firstName: userFixture.firstName,
      lastName: userFixture.lastName,
      email: userFixture.email,
    },
  },
  vehicle: {
    id: vehicleFixture.id,
    make: vehicleFixture.make,
    model: vehicleFixture.model,
    year: vehicleFixture.year,
    number: vehicleFixture.number,
    category: vehicleFixture.category,
  },
  event: {
    id: eventFixture.id,
    name: eventFixture.name,
    type: eventFixture.type,
    venue: eventFixture.venue,
    location: eventFixture.location,
    startDate: eventFixture.startDate,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAuthToken(userId: string, role: string): string {
  return jwt.sign({ userId, email: userFixture.email, role }, JWT_SECRET, { expiresIn: '1h' });
}

// ─── Health Check ─────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── Auth Flow ────────────────────────────────────────────────────────────────

describe('Auth Flow: Register → Login → Get Profile', () => {
  beforeAll(async () => {
    const bcrypt = await import('bcryptjs');
    userFixture.passwordHash = await bcrypt.hash('SecurePass1!', 10);
  });

  it('POST /api/auth/register — creates a new user and returns a token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(userFixture as any);

    const res = await request(app).post('/api/auth/register').send({
      email: userFixture.email,
      password: 'SecurePass1!',
      firstName: userFixture.firstName,
      lastName: userFixture.lastName,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(userFixture.email);
  });

  it('POST /api/auth/register — returns 409 for duplicate email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userFixture as any);

    const res = await request(app).post('/api/auth/register').send({
      email: userFixture.email,
      password: 'SecurePass1!',
      firstName: 'Dup',
      lastName: 'User',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login — returns a token for valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userFixture as any);

    const res = await request(app).post('/api/auth/login').send({
      email: userFixture.email,
      password: 'SecurePass1!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/login — returns 401 for wrong password', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userFixture as any);

    const res = await request(app).post('/api/auth/login').send({
      email: userFixture.email,
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me — returns user profile with valid token', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...userFixture,
      driver: null,
    } as any);

    const token = makeAuthToken(userFixture.id, userFixture.role);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(userFixture.email);
  });

  it('GET /api/auth/me — returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ─── Vehicle Flow ─────────────────────────────────────────────────────────────

describe('Vehicle Flow: Create, Read, Update, Delete', () => {
  it('GET /api/vehicles — returns 401 without authentication', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('GET /api/vehicles — returns vehicle list with valid token', async () => {
    prismaMock.vehicle.findMany.mockResolvedValue([vehicleFixture] as any);

    const token = makeAuthToken(userFixture.id, 'user');
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST /api/vehicles — creates a vehicle as a user', async () => {
    prismaMock.vehicle.create.mockResolvedValue(vehicleFixture as any);

    const token = makeAuthToken(userFixture.id, 'user');
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        make: vehicleFixture.make,
        model: vehicleFixture.model,
        year: vehicleFixture.year,
        category: vehicleFixture.category,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.make).toBe('Porsche');
  });

  it('POST /api/vehicles — returns 403 when a viewer attempts to create', async () => {
    const token = makeAuthToken(userFixture.id, 'viewer');
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        make: vehicleFixture.make,
        model: vehicleFixture.model,
        year: vehicleFixture.year,
        category: vehicleFixture.category,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/vehicles/:id — deletes a vehicle as admin', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(vehicleFixture as any);
    prismaMock.vehicle.delete.mockResolvedValue(vehicleFixture as any);

    const token = makeAuthToken(userFixture.id, 'admin');
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleFixture.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Full Integration Flow ────────────────────────────────────────────────────

describe('Full Flow: Register → Login → Create Vehicle → Record Lap Time', () => {
  it('completes the full workflow end-to-end', async () => {
    // Step 1: Register
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce(userFixture as any);

    const registerRes = await request(app).post('/api/auth/register').send({
      email: userFixture.email,
      password: 'SecurePass1!',
      firstName: userFixture.firstName,
      lastName: userFixture.lastName,
    });

    expect(registerRes.status).toBe(201);
    const token = registerRes.body.data.token as string;
    expect(token).toBeDefined();

    // Step 2: Login (verify token works)
    prismaMock.user.findUnique.mockResolvedValueOnce(userFixture as any);

    const loginRes = await request(app).post('/api/auth/login').send({
      email: userFixture.email,
      password: 'SecurePass1!',
    });

    expect(loginRes.status).toBe(200);
    const loginToken = loginRes.body.data.token as string;

    // Step 3: Create a vehicle
    prismaMock.vehicle.create.mockResolvedValueOnce(vehicleFixture as any);

    const vehicleRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${loginToken}`)
      .send({
        make: vehicleFixture.make,
        model: vehicleFixture.model,
        year: vehicleFixture.year,
        category: vehicleFixture.category,
      });

    expect(vehicleRes.status).toBe(201);
    const vehicleId = vehicleRes.body.data.id as string;
    expect(vehicleId).toBe(vehicleFixture.id);

    // Step 4: Record a lap time
    prismaMock.driver.findUnique.mockResolvedValueOnce(driverFixture as any);
    prismaMock.vehicle.findUnique.mockResolvedValueOnce(vehicleFixture as any);
    prismaMock.event.findUnique.mockResolvedValueOnce(eventFixture as any);
    prismaMock.lapTime.create.mockResolvedValueOnce(lapTimeFixture as any);

    const lapRes = await request(app)
      .post('/api/analytics/laptimes')
      .set('Authorization', `Bearer ${loginToken}`)
      .send({
        driverId: driverFixture.id,
        vehicleId: vehicleId,
        eventId: eventFixture.id,
        lapNumber: 1,
        lapTimeMs: 134567,
        sessionType: 'Race',
      });

    expect(lapRes.status).toBe(201);
    expect(lapRes.body.success).toBe(true);
    expect(lapRes.body.data.lapTimeFormatted).toBe('02:14.567');
    expect(lapRes.body.data.vehicleId).toBe(vehicleFixture.id);
  });
});

// ─── Event Flow ───────────────────────────────────────────────────────────────

describe('Event Flow: Create, Read, Delete', () => {
  const validEventBody = {
    name: eventFixture.name,
    type: eventFixture.type,
    venue: eventFixture.venue,
    location: eventFixture.location,
    startDate: eventFixture.startDate.toISOString(),
    endDate: eventFixture.endDate.toISOString(),
  };

  it('POST /api/events — creates an event as admin', async () => {
    prismaMock.event.create.mockResolvedValue(eventFixture as any);

    const token = makeAuthToken(userFixture.id, 'admin');
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validEventBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(eventFixture.name);
  });

  it('GET /api/events/:id — returns 404 for a non-existent event', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);

    const token = makeAuthToken(userFixture.id, 'user');
    const res = await request(app)
      .get('/api/events/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/events — returns 400 for missing required fields', async () => {
    const token = makeAuthToken(userFixture.id, 'admin');
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Incomplete Event' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
