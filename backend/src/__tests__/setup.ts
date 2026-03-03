import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables before any module is imported
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
