import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login an existing user
router.post('/login', login);

// GET /api/auth/me - Get the current authenticated user's profile
router.get('/me', authenticate, getMe);

export default router;
