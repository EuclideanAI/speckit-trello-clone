import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/board/route';
import { prisma } from '@/__tests__/mocks/prisma';

/**
 * Integration Test: GET /api/board
 * 
 * Tests the API endpoint that fetches board data with columns and tasks
 */

// Mock the db module to use our mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma,
}));

describe('GET /api/board', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * T029: Integration test for GET /api/board
   * Should return board with all columns and tasks
   */
  it('should return board with columns and tasks', async () => {
    // Mock data matching our seed data structure
    const mockBoard = {
      id: 'board-1',
      name: 'My Kanban Board',
      createdAt: new Date(),
      updatedAt: new Date(),
      columns: [
        {
          id: 'col-1',
          boardId: 'board-1',
          name: 'To Do',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: [
            {
              id: 'task-1',
              columnId: 'col-1',
              title: 'Setup project structure',
              description: null,
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'task-2',
              columnId: 'col-1',
              title: 'Design database schema',
              description: null,
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
        {
          id: 'col-2',
          boardId: 'board-1',
          name: 'In Progress',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: [
            {
              id: 'task-3',
              columnId: 'col-2',
              title: 'Create task components',
              description: 'Build TaskCard, TaskForm components',
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
        {
          id: 'col-3',
          boardId: 'board-1',
          name: 'Done',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: [
            {
              id: 'task-4',
              columnId: 'col-3',
              title: 'Initialize Next.js project',
              description: 'Setup Next.js 15 with TypeScript',
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    };

    // Mock Prisma client response
    prisma.board.findFirst = vi.fn().mockResolvedValue(mockBoard);

    // Call the API route handler
    const response = await GET();
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name', 'My Kanban Board');
    expect(data).toHaveProperty('columns');
    expect(data.columns).toHaveLength(3);

    // Verify columns are ordered correctly
    expect(data.columns[0].name).toBe('To Do');
    expect(data.columns[1].name).toBe('In Progress');
    expect(data.columns[2].name).toBe('Done');

    // Verify tasks are included
    expect(data.columns[0].tasks).toHaveLength(2);
    expect(data.columns[1].tasks).toHaveLength(1);
    expect(data.columns[2].tasks).toHaveLength(1);

    // Verify Prisma was called with correct query
    expect(prisma.board.findFirst).toHaveBeenCalledWith({
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  });

  it('should handle case when no board exists', async () => {
    // Mock Prisma to return null
    prisma.board.findFirst = vi.fn().mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/board not found/i);
  });

  it('should handle database errors gracefully', async () => {
    // Mock Prisma to throw an error
    prisma.board.findFirst = vi.fn().mockRejectedValue(new Error('Database connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/internal server error/i);
  });

  it('should return tasks ordered by order field', async () => {
    const mockBoard = {
      id: 'board-1',
      name: 'My Kanban Board',
      createdAt: new Date(),
      updatedAt: new Date(),
      columns: [
        {
          id: 'col-1',
          boardId: 'board-1',
          name: 'To Do',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: [
            {
              id: 'task-3',
              columnId: 'col-1',
              title: 'Third task',
              description: null,
              order: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'task-1',
              columnId: 'col-1',
              title: 'First task',
              description: null,
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'task-2',
              columnId: 'col-1',
              title: 'Second task',
              description: null,
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    };

    prisma.board.findFirst = vi.fn().mockResolvedValue(mockBoard);

    const response = await GET();
    const data = await response.json();

    // Tasks should be ordered 0, 1, 2 (not by creation order)
    expect(data.columns[0].tasks[0].title).toBe('First task');
    expect(data.columns[0].tasks[1].title).toBe('Second task');
    expect(data.columns[0].tasks[2].title).toBe('Third task');
  });
});
