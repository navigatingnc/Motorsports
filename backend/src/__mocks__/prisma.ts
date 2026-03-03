import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// We import the type from @prisma/client for accurate typing.
// The actual PrismaClient is never instantiated in tests.
const { PrismaClient } = require('@prisma/client') as {
  PrismaClient: new () => any;
};

const prismaMock = mockDeep<InstanceType<typeof PrismaClient>>();

export default prismaMock;
export { prismaMock };
