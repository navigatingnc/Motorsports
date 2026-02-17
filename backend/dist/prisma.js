"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./generated/prisma");
const prisma = new prisma_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
exports.default = prisma;
//# sourceMappingURL=prisma.js.map