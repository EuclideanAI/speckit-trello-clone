import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PATCH } from '@/app/api/tasks/reorder/route';
import { prisma } from '@/__tests__/mocks/prisma';
import { NextRequest } from 'next/server';

/**
 * Integration Test: PATCH /api/tasks/reorder
 * 
 * Tests the API endpoint that handles task reordering and moving between columns
 */

// Mock the db module
vi.mock('@/lib/db', () => ({
  prisma,
}));

describe('PATCH /api/tasks/reorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * T047: Integration test for PATCH /api/tasks/reorder
   * Should move task to different column and update order
   */
  it('should move task to different column', async () => {
    const requestBody = {
      taskId: 'task-1',
      sourceColumnId: 'col-1',
      destinationColumnId: 'col-2',
      newOrder: 0,
    };

    // Mock the task being moved
    const mockTask = {
      id: 'task-1',
      columnId: 'col-1',
      title: 'Test Task',
      description: null,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock aggregate to return max order in destination column
    prisma.task.aggregate = vi.fn().mockResolvedValue({
      _max: { order: 2 },
    });

    // Mock transaction
    prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
      const tx = {
        task: {
          update: vi.fn().mockResolvedValue({
            ...mockTask,
            columnId: 'col-2',
            order: 0,
          }),
          findMany: vi.fn().mockResolvedValue([]),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      };
      return callback(tx);
    });

    // Create request
    const request = new NextRequest('http://localhost:3000/api/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('task');
    expect(data.task.columnId).toBe('col-2');
  });

  it('should reorder task within same column', async () => {
    const requestBody = {
      taskId: 'task-1',
      sourceColumnId: 'col-1',
      destinationColumnId: 'col-1', // Same column
      newOrder: 2,
    };

    const mockTasks = [
      { id: 'task-1', columnId: 'col-1', order: 0, title: 'Task 1' },
      { id: 'task-2', columnId: 'col-1', order: 1, title: 'Task 2' },
      { id: 'task-3', columnId: 'col-1', order: 2, title: 'Task 3' },
    ];

    prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
      const tx = {
        task: {
          findMany: vi.fn().mockResolvedValue(mockTasks),
          update: vi.fn().mockImplementation(({ where, data }) => {
            const task = mockTasks.find((t) => t.id === where.id);
            return Promise.resolve({ ...task, ...data });
          }),
        },
      };
      return callback(tx);
    });

    const request = new NextRequest('http://localhost:3000/api/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/reordered successfully/i);
  });

  it('should validate request body with Zod schema', async () => {
    const invalidBody = {
      taskId: 'task-1',
      // Missing required fields
    };

    const request = new NextRequest('http://localhost:3000/api/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify(invalidBody),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/validation/i);
  });

  it('should handle task not found', async () => {
    const requestBody = {
      taskId: 'non-existent',
      sourceColumnId: 'col-1',
      destinationColumnId: 'col-2',
      newOrder: 0,
    };

    prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
      const tx = {
        task: {
          update: vi.fn().mockRejectedValue(new Error('Record not found')),
          findMany: vi.fn().mockResolvedValue([]),
        },
      };
      return callback(tx);
    });

    const request = new NextRequest('http://localhost:3000/api/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/not found/i);
  });

  it('should handle database errors gracefully', async () => {
    const requestBody = {
      taskId: 'task-1',
      sourceColumnId: 'col-1',
      destinationColumnId: 'col-2',
      newOrder: 0,
    };

    prisma.$transaction = vi.fn().mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/internal server error/i);
  });

  it('should update order of affected tasks when moving between columns', async () => {
    const requestBody = {
      taskId: 'task-1',
      sourceColumnId: 'col-1',
      destinationColumnId: 'col-2',
      newOrder: 1,
    };

    const sourceTasks = [
      { id: 'task-1', columnId: 'col-1', order: 0 },
      { id: 'task-2', columnId: 'col-1', order: 1 },
      { id: 'task-3', columnId: 'col-1', order: 2 },
    ];

    const destTasks = [
      { id: 'task-4', columnId: 'col-2', order: 0 },
      { id: 'task-5', columnId: 'col-2', order: 1 },
    ];

    let updateCount = 0;

    prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
      const tx = {
        task: {
          update: vi.fn().mockImplementation(() => {
            updateCount++;
            return Promise.resolve({ id: 'task-1', columnId: 'col-2', order: 1 });
          }),
          findMany: vi.fn().mockResolvedValue([...sourceTasks, ...destTasks]),
          updateMany: vi.fn().mockImplementation(() => {
            updateCount++;
            return Promise.resolve({ count: 2 });
          }),
        },
      };
      return callback(tx);
    });

    const request = new NextRequest('http://localhost:3000/api/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    // Verify multiple updates occurred
    expect(updateCount).toBeGreaterThan(0);
  });
});
