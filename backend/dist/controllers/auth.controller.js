"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_types_1 = require("../types/auth.types");
const SALT_ROUNDS = 12;
/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: email, password, firstName, and lastName are required.',
            });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                error: 'Invalid email format.',
            });
            return;
        }
        // Validate password strength
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long.',
            });
            return;
        }
        // Validate role if provided
        const assignedRole = role ?? 'user';
        if (!auth_types_1.VALID_ROLES.includes(assignedRole)) {
            res.status(400).json({
                success: false,
                error: `Invalid role. Must be one of: ${auth_types_1.VALID_ROLES.join(', ')}`,
            });
            return;
        }
        // Check if email already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                error: 'An account with this email address already exists.',
            });
            return;
        }
        // Hash the password
        const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        // Create the user
        const user = await prisma_1.default.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                firstName,
                lastName,
                role: assignedRole,
            },
        });
        // Generate JWT token
        const jwtSecret = process.env['JWT_SECRET'];
        if (!jwtSecret) {
            res.status(500).json({
                success: false,
                error: 'Server configuration error.',
            });
            return;
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';
        const token = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn });
        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.',
        });
    }
};
exports.register = register;
/**
 * Login an existing user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: email and password are required.',
            });
            return;
        }
        // Find user by email
        const user = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password.',
            });
            return;
        }
        // Check if account is active
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                error: 'Account is deactivated. Please contact an administrator.',
            });
            return;
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password.',
            });
            return;
        }
        // Generate JWT token
        const jwtSecret = process.env['JWT_SECRET'];
        if (!jwtSecret) {
            res.status(500).json({
                success: false,
                error: 'Server configuration error.',
            });
            return;
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';
        const token = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn });
        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.',
        });
    }
};
exports.login = login;
/**
 * Get the currently authenticated user's profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated.',
            });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            include: {
                driver: true,
            },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found.',
            });
            return;
        }
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive,
                driver: user.driver,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user profile.',
        });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map