import { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';

/**
 * Mock Prisma Client for testing
 * This allows tests to run without a real database connection
 */
export const prisma = {
  board: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  column: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  task: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(prisma)),
} as unknown as PrismaClient;
