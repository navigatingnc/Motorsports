# Phase 6: Backend: `User` & `Driver` Models & Auth

**Date:** February 20, 2026  
**Status:** ✅ Completed

---

### Summary
Successfully implemented the `User` and `Driver` models in Prisma with a one-to-one relationship. Built a complete authentication system using bcrypt for password hashing and JSON Web Tokens (JWT) for session management. The implementation includes `/api/auth/register` and `/api/auth/login` endpoints, a protected `/api/auth/me` profile endpoint, reusable JWT authentication middleware, and a full CRUD API for driver profiles at `/api/drivers`. All endpoints follow the established response format and include comprehensive input validation and error handling.

### Work Performed

1. **Dependencies Installed**
   - **Runtime:** `bcryptjs` (password hashing), `jsonwebtoken` (JWT generation/verification)
   - **Development:** `@types/bcryptjs`, `@types/jsonwebtoken`

2. **Database Schema — `User` Model**
   - `id` (UUID, primary key)
   - `email` (string, unique, required)
   - `passwordHash` (string, required — stores bcrypt hash, never plaintext)
   - `role` (string, default `"user"`) — valid values: `"admin"`, `"user"`, `"viewer"`
   - `firstName` / `lastName` (string, required)
   - `isActive` (boolean, default `true`)
   - `createdAt` / `updatedAt` (timestamps, auto-managed)
   - One-to-one relation to `Driver`

3. **Database Schema — `Driver` Model**
   - `id` (UUID, primary key)
   - `userId` (string, unique FK → `User.id`, cascade delete)
   - `licenseNumber` (string, optional, unique)
   - `nationality` (string, optional)
   - `dateOfBirth` (DateTime, optional)
   - `bio` (text, optional)
   - `emergencyContact` (string, optional)
   - `medicalNotes` (text, optional)
   - `createdAt` / `updatedAt` (timestamps, auto-managed)

4. **Database Migration**
   - Created and applied migration `20260220134253_add_user_driver_models`
   - Regenerated Prisma Client to include `User` and `Driver` models

5. **Auth Controller** (`src/controllers/auth.controller.ts`)
   - `POST /api/auth/register` — validates input, checks for duplicate email, hashes password with bcrypt (12 salt rounds), creates user, returns JWT
   - `POST /api/auth/login` — validates credentials, verifies bcrypt hash, checks `isActive` flag, returns JWT
   - `GET /api/auth/me` — protected endpoint returning full user profile including associated driver record

6. **Auth Middleware** (`src/middleware/auth.middleware.ts`)
   - `authenticate` — extracts Bearer token from `Authorization` header, verifies JWT signature, attaches decoded payload to `req.user`
   - `requireAdmin` — role-based guard restricting access to `admin` role users
   - Extended Express `Request` type to include `user?: JwtPayload`

7. **Driver Controller** (`src/controllers/driver.controller.ts`)
   - Full CRUD: `GET /api/drivers`, `GET /api/drivers/:id`, `POST /api/drivers`, `PUT /api/drivers/:id`, `DELETE /api/drivers/:id`
   - All endpoints protected by `authenticate` middleware
   - Responses include joined `user` data (email, name, role)

8. **Type Definitions**
   - `src/types/auth.types.ts` — `RegisterDto`, `LoginDto`, `JwtPayload`, `AuthResponse`, `VALID_ROLES`
   - `src/types/driver.types.ts` — `CreateDriverDto`, `UpdateDriverDto`

9. **Route Registration** — Updated `src/index.ts` to mount:
   - `authRoutes` at `/api/auth`
   - `driverRoutes` at `/api/drivers`

### Code Generated

#### `backend/prisma/schema.prisma` (updated)
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Vehicle {
  id          String   @id @default(uuid())
  make        String
  model       String
  year        Int
  category    String
  number      String?
  vin         String?  @unique
  notes       String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("vehicles")
}

model Event {
  id          String    @id @default(uuid())
  name        String
  type        String
  venue       String
  location    String
  startDate   DateTime
  endDate     DateTime
  status      String    @default("Upcoming")
  description String?   @db.Text
  notes       String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("events")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         String   @default("user")
  firstName    String
  lastName     String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  driver       Driver?

  @@map("users")
}

model Driver {
  id               String    @id @default(uuid())
  userId           String    @unique
  licenseNumber    String?   @unique
  nationality      String?
  dateOfBirth      DateTime?
  bio              String?   @db.Text
  emergencyContact String?
  medicalNotes     String?   @db.Text
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("drivers")
}
```

#### `backend/prisma/migrations/20260220134253_add_user_driver_models/migration.sql`
```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "nationality" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "bio" TEXT,
    "emergencyContact" TEXT,
    "medicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");
-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### `backend/src/types/auth.types.ts`
```typescript
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const VALID_ROLES = ['admin', 'user', 'viewer'] as const;
```

#### `backend/src/types/driver.types.ts`
```typescript
export interface CreateDriverDto {
  userId: string;
  licenseNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  bio?: string;
  emergencyContact?: string;
  medicalNotes?: string;
}

export interface UpdateDriverDto {
  licenseNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  bio?: string;
  emergencyContact?: string;
  medicalNotes?: string;
}
```

#### `backend/src/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
    return;
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env['JWT_SECRET'];

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      error: 'Server configuration error: JWT secret not set.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Access denied. Admin role required.' });
    return;
  }
  next();
};
```

#### `backend/src/controllers/auth.controller.ts`
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { RegisterDto, LoginDto, JwtPayload, VALID_ROLES } from '../types/auth.types';

const SALT_ROUNDS = 12;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role }: RegisterDto = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, error: 'Missing required fields: email, password, firstName, and lastName are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: 'Invalid email format.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
      return;
    }

    const assignedRole = role ?? 'user';
    if (!VALID_ROLES.includes(assignedRole as (typeof VALID_ROLES)[number])) {
      res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash, firstName, lastName, role: assignedRole },
    });

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) { res.status(500).json({ success: false, error: 'Server configuration error.' }); return; }

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDto = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Missing required fields: email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) { res.status(401).json({ success: false, error: 'Invalid email or password.' }); return; }
    if (!user.isActive) { res.status(403).json({ success: false, error: 'Account is deactivated. Please contact an administrator.' }); return; }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) { res.status(401).json({ success: false, error: 'Invalid email or password.' }); return; }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) { res.status(500).json({ success: false, error: 'Server configuration error.' }); return; }

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.json({
      success: true,
      message: 'Login successful.',
      data: { token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: 'Not authenticated.' }); return; }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { driver: true },
    });

    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }

    res.json({
      success: true,
      data: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        role: user.role, isActive: user.isActive, driver: user.driver,
        createdAt: user.createdAt, updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
};
```

#### `backend/src/controllers/driver.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import { CreateDriverDto, UpdateDriverDto } from '../types/driver.types';

const userSelect = { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true };

export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await prisma.driver.findMany({ include: { user: { select: userSelect } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: drivers, count: drivers.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch drivers.' });
  }
};

export const getDriverById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const driver = await prisma.driver.findUnique({ where: { id }, include: { user: { select: userSelect } } });
    if (!driver) { res.status(404).json({ success: false, error: 'Driver not found.' }); return; }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch driver.' });
  }
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverData: CreateDriverDto = req.body;
    if (!driverData.userId) { res.status(400).json({ success: false, error: 'Missing required field: userId is required.' }); return; }
    const user = await prisma.user.findUnique({ where: { id: driverData.userId } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
    const existingDriver = await prisma.driver.findUnique({ where: { userId: driverData.userId } });
    if (existingDriver) { res.status(409).json({ success: false, error: 'A driver profile already exists for this user.' }); return; }
    const driver = await prisma.driver.create({
      data: {
        userId: driverData.userId,
        licenseNumber: driverData.licenseNumber ?? null,
        nationality: driverData.nationality ?? null,
        dateOfBirth: driverData.dateOfBirth ? new Date(driverData.dateOfBirth) : null,
        bio: driverData.bio ?? null,
        emergencyContact: driverData.emergencyContact ?? null,
        medicalNotes: driverData.medicalNotes ?? null,
      },
      include: { user: { select: userSelect } },
    });
    res.status(201).json({ success: true, data: driver, message: 'Driver profile created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create driver profile.' });
  }
};

export const updateDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData: UpdateDriverDto = req.body;
    const existingDriver = await prisma.driver.findUnique({ where: { id } });
    if (!existingDriver) { res.status(404).json({ success: false, error: 'Driver not found.' }); return; }
    const driver = await prisma.driver.update({
      where: { id },
      data: {
        ...(updateData.licenseNumber !== undefined && { licenseNumber: updateData.licenseNumber }),
        ...(updateData.nationality !== undefined && { nationality: updateData.nationality }),
        ...(updateData.dateOfBirth !== undefined && { dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null }),
        ...(updateData.bio !== undefined && { bio: updateData.bio }),
        ...(updateData.emergencyContact !== undefined && { emergencyContact: updateData.emergencyContact }),
        ...(updateData.medicalNotes !== undefined && { medicalNotes: updateData.medicalNotes }),
      },
      include: { user: { select: userSelect } },
    });
    res.json({ success: true, data: driver, message: 'Driver profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update driver profile.' });
  }
};

export const deleteDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const existingDriver = await prisma.driver.findUnique({ where: { id } });
    if (!existingDriver) { res.status(404).json({ success: false, error: 'Driver not found.' }); return; }
    await prisma.driver.delete({ where: { id } });
    res.json({ success: true, message: 'Driver profile deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete driver profile.' });
  }
};
```

#### `backend/src/routes/auth.routes.ts`
```typescript
import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
```

#### `backend/src/routes/driver.routes.ts`
```typescript
import { Router } from 'express';
import { getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from '../controllers/driver.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;
```

#### `backend/src/index.ts` (updated)
```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vehicleRoutes from './routes/vehicle.routes';
import eventRoutes from './routes/event.routes';
import authRoutes from './routes/auth.routes';
import driverRoutes from './routes/driver.routes';

dotenv.config();

const app: Express = express();
const port = process.env['PORT'] || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Motorsports Management API is running', timestamp: new Date().toISOString() });
});

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Motorsports Management API', version: '1.0.0', endpoints: { auth: '/api/auth', vehicles: '/api/vehicles', events: '/api/events', drivers: '/api/drivers' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/drivers', driverRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`🏁[motorsports]: Motorsports Management API initialized`);
  console.log(`🔐[auth]: Authentication endpoints available at /api/auth`);
});

export default app;
```

### API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes (Bearer) | Get current user profile |
| GET | `/api/drivers` | Yes (Bearer) | Get all driver profiles |
| GET | `/api/drivers/:id` | Yes (Bearer) | Get driver by ID |
| POST | `/api/drivers` | Yes (Bearer) | Create driver profile |
| PUT | `/api/drivers/:id` | Yes (Bearer) | Update driver profile |
| DELETE | `/api/drivers/:id` | Yes (Bearer) | Delete driver profile |

### Security Design

- Passwords are hashed using **bcrypt** with 12 salt rounds before storage — plaintext passwords are never persisted
- JWTs are signed with `HS256` algorithm using a configurable `JWT_SECRET` environment variable
- Token payload includes `userId`, `email`, and `role` for downstream authorization decisions
- The `authenticate` middleware validates the token on every protected route before the handler executes
- Email addresses are normalized to lowercase before storage and lookup to prevent duplicate accounts

### Testing Verified
- `POST /api/auth/register` — returns `201` with JWT and user object
- `POST /api/auth/login` — returns `200` with JWT and user object
- `GET /api/auth/me` — returns `200` with full user profile including driver relation
- Duplicate email registration returns `409 Conflict`
- Missing fields return `400 Bad Request`
- Invalid token returns `401 Unauthorized`

### Next Phase Preview
Phase 7 will implement the frontend authentication flow: `LoginPage.tsx`, `RegisterPage.tsx`, secure JWT storage, and an Axios interceptor to attach the auth token to all outgoing API requests.

---
