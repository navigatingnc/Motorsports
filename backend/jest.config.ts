import type { Config } from 'jest';
import path from 'path';

// Resolve the actual location of the generated Prisma client in the pnpm store.
// pnpm hoists .prisma/client as a sibling of @prisma/client inside the virtual
// store, so we must map the bare specifier to the correct absolute path.
const prismaClientDir = path.dirname(require.resolve('@prisma/client'));
const dotPrismaClientDir = path.resolve(prismaClientDir, '../../.prisma/client');

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    // Redirect the project's own prisma singleton to the deep mock
    '^../prisma$': '<rootDir>/src/__mocks__/prisma.ts',
    '^../../prisma$': '<rootDir>/src/__mocks__/prisma.ts',
    // Fix pnpm .prisma/client resolution inside Jest's module resolver
    '^\\.prisma/client/(.*)$': `${dotPrismaClientDir}/$1`,
  },
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/controllers/**/*.ts',
    'src/middleware/**/*.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          esModuleInterop: true,
          noUncheckedIndexedAccess: false,
          exactOptionalPropertyTypes: false,
        },
      },
    ],
  },
  testTimeout: 30000,
};

export default config;
