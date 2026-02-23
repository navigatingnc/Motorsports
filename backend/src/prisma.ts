import 'dotenv/config';
import { PrismaClient } from './generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  console.warn('⚠️ [database]: DATABASE_URL is not set in environment variables');
}

// Create a new connection pool using the connection string
const pool = new Pool({
  connectionString: connectionString || undefined
});

// Create the Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

export default prisma;
