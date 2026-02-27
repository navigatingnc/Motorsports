"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const { PrismaClient } = require('@prisma/client');
const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
    console.warn('⚠️ [database]: DATABASE_URL is not set in environment variables');
}
const pool = new pg_1.Pool({
    connectionString: connectionString || undefined,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
exports.default = prisma;
//# sourceMappingURL=prisma.js.map