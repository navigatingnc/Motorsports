/**
 * Unit tests for the Auth Middleware
 * Tests authenticate, requireAdmin, and requireRole middleware functions.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, requireAdmin, requireRole } from '../../middleware/auth.middleware';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockRes(): { res: Partial<Response>; json: jest.Mock; status: jest.Mock } {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnThis();
  (status as jest.Mock).mockImplementation(() => ({ json }));
  const res = { json, status } as Partial<Response>;
  return { res, json, status };
}

const JWT_SECRET = 'test-jwt-secret-for-unit-tests-only-not-for-production';

function makeToken(payload: object, secret = JWT_SECRET): string {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

// ─── authenticate ────────────────────────────────────────────────────────────

describe('authenticate middleware', () => {
  it('returns 401 when no Authorization header is present', () => {
    const req = { headers: {} } as Partial<Request>;
    const { res, status, json } = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req as Request, res as Response, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Access denied. No token provided.' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the Authorization header does not start with "Bearer "', () => {
    const req = { headers: { authorization: 'Token abc123' } } as Partial<Request>;
    const { res, status, json } = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req as Request, res as Response, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is invalid or expired', () => {
    const req = {
      headers: { authorization: 'Bearer invalid.token.here' },
    } as Partial<Request>;
    const { res, status } = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req as Request, res as Response, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and attaches user to request when token is valid', () => {
    const payload = { userId: 'user-id', email: 'test@example.com', role: 'user' };
    const token = makeToken(payload);

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Partial<Request>;
    const { res } = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).user.userId).toBe(payload.userId);
    expect((req as any).user.email).toBe(payload.email);
    expect((req as any).user.role).toBe(payload.role);
  });
});

// ─── requireAdmin ────────────────────────────────────────────────────────────

describe('requireAdmin middleware', () => {
  it('returns 401 when no user is attached to the request', () => {
    const req = {} as Partial<Request>;
    const { res, status } = mockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req as Request, res as Response, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when the user role is not admin', () => {
    const req = { user: { userId: 'id', email: 'e@e.com', role: 'user' } } as Partial<Request>;
    const { res, status, json } = mockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req as Request, res as Response, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Access denied. Admin role required.' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when the user has the admin role', () => {
    const req = { user: { userId: 'id', email: 'admin@e.com', role: 'admin' } } as Partial<Request>;
    const { res } = mockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

// ─── requireRole ─────────────────────────────────────────────────────────────

describe('requireRole middleware', () => {
  it('returns 401 when no user is attached to the request', () => {
    const req = {} as Partial<Request>;
    const { res, status } = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin', 'user')(req as Request, res as Response, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when the user role is not in the allowed list', () => {
    const req = { user: { userId: 'id', email: 'e@e.com', role: 'viewer' } } as Partial<Request>;
    const { res, status } = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin', 'user')(req as Request, res as Response, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when the user role is in the allowed list', () => {
    const req = { user: { userId: 'id', email: 'e@e.com', role: 'user' } } as Partial<Request>;
    const { res } = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin', 'user')(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('calls next() when the user has the admin role and admin is allowed', () => {
    const req = { user: { userId: 'id', email: 'admin@e.com', role: 'admin' } } as Partial<Request>;
    const { res } = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
