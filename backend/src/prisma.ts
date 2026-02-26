import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const { PrismaClient } = require('@prisma/client') as {
  PrismaClient: new (options?: unknown) => any;
};

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  console.warn('⚠️ [database]: DATABASE_URL is not set in environment variables');
}

const pool = new Pool({
  connectionString: connectionString || undefined,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
