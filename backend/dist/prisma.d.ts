import { PrismaClient } from './generated/prisma';
declare const prisma: PrismaClient<{
    log: ("info" | "query" | "warn" | "error")[];
}, "info" | "query" | "warn" | "error", import("./generated/prisma/runtime/client").DefaultArgs>;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map