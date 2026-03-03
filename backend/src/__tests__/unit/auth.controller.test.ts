/**
 * Unit tests for the Auth Controller
 * Prisma is fully mocked — no real database connection is required.
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prismaMock } from '../../__mocks__/prisma';
import { register, login, getMe } from '../../controllers/auth.controller';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockReq(body: Record<string, unknown> = {}, params: Record<string, string> = {}, user?: any): Partial<Request> {
  return { body, params, user } as Partial<Request>;
}

function mockRes(): { res: Partial<Response>; json: jest.Mock; status: jest.Mock } {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnThis();
  const res = { json, status } as Partial<Response>;
  (status as jest.Mock).mockImplementation(() => ({ json }));
  return { res, json, status };
}

// ─── register ───────────────────────────────────────────────────────────────

describe('AuthController.register', () => {
  const validBody = {
    email: 'driver@example.com',
    password: 'SecurePass1',
    firstName: 'John',
    lastName: 'Doe',
  };

  it('returns 400 when required fields are missing', async () => {
    const req = mockReq({ email: 'test@test.com' });
    const { res, status, json } = mockRes();

    await register(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('returns 400 for an invalid email format', async () => {
    const req = mockReq({ ...validBody, email: 'not-an-email' });
    const { res, status, json } = mockRes();

    await register(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid email format.' }),
    );
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const req = mockReq({ ...validBody, password: 'short' });
    const { res, status, json } = mockRes();

    await register(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Password must be at least 8 characters long.' }),
    );
  });

  it('returns 400 for an invalid role value', async () => {
    const req = mockReq({ ...validBody, role: 'superuser' });
    const { res, status, json } = mockRes();

    await register(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('returns 409 when the email is already registered', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing-id',
      email: validBody.email,
      passwordHash: 'hash',
      role: 'user',
      firstName: 'Jane',
      lastName: 'Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      driver: null,
      setupSheets: [],
      uploads: [],
    } as any);

    const req = mockReq(validBody);
    const { res, status, json } = mockRes();

    await register(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'An account with this email address already exists.' }),
    );
  });

  it('returns 201 with token and user data on successful registration', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: validBody.email.toLowerCase(),
      passwordHash: 'hashed',
      role: 'user',
      firstName: validBody.firstName,
      lastName: validBody.lastName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const req = mockReq(validBody);
    const { res, status, json } = mockRes();

    await register(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.token).toBeDefined();
    expect(call.data.user.email).toBe(validBody.email.toLowerCase());
  });
});

// ─── login ───────────────────────────────────────────────────────────────────

describe('AuthController.login', () => {
  const validUser = {
    id: 'user-id-1',
    email: 'driver@example.com',
    passwordHash: '',
    role: 'user',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    validUser.passwordHash = await bcrypt.hash('SecurePass1', 10);
  });

  it('returns 400 when email or password is missing', async () => {
    const req = mockReq({ email: 'driver@example.com' });
    const { res, status, json } = mockRes();

    await login(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 401 when the user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = mockReq({ email: 'unknown@example.com', password: 'anypassword' });
    const { res, status, json } = mockRes();

    await login(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid email or password.' }),
    );
  });

  it('returns 403 when the account is deactivated', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...validUser, isActive: false } as any);

    const req = mockReq({ email: validUser.email, password: 'SecurePass1' });
    const { res, status, json } = mockRes();

    await login(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Account is deactivated. Please contact an administrator.' }),
    );
  });

  it('returns 401 when the password is incorrect', async () => {
    prismaMock.user.findUnique.mockResolvedValue(validUser as any);

    const req = mockReq({ email: validUser.email, password: 'WrongPassword' });
    const { res, status, json } = mockRes();

    await login(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid email or password.' }),
    );
  });

  it('returns 200 with token on successful login', async () => {
    prismaMock.user.findUnique.mockResolvedValue(validUser as any);

    const req = mockReq({ email: validUser.email, password: 'SecurePass1' });
    const { res, json } = mockRes();

    await login(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.token).toBeDefined();
    expect(call.data.user.id).toBe(validUser.id);
  });
});

// ─── getMe ───────────────────────────────────────────────────────────────────

describe('AuthController.getMe', () => {
  it('returns 401 when no user is attached to the request', async () => {
    const req = mockReq({}, {}, undefined);
    const { res, status, json } = mockRes();

    await getMe(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 404 when the user ID from the token does not exist in the DB', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = mockReq({}, {}, { userId: 'ghost-id', email: 'ghost@x.com', role: 'user' });
    const { res, status, json } = mockRes();

    await getMe(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'User not found.' }));
  });

  it('returns 200 with user profile on success', async () => {
    const user = {
      id: 'user-id-1',
      email: 'driver@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isActive: true,
      driver: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.user.findUnique.mockResolvedValue(user as any);

    const req = mockReq({}, {}, { userId: user.id, email: user.email, role: user.role });
    const { res, json } = mockRes();

    await getMe(req as Request, res as Response);

    const call = json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.email).toBe(user.email);
  });
});
