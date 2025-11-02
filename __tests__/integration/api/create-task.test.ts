import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/tasks/route';
import { prisma } from '@/lib/db';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('POST /api/tasks - T066: Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a task with title only', async () => {
    const mockTask = {
      id: 'task_123',
      columnId: 'col_1',
      title: 'New task',
      description: null,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock count to return 0 (first task in column)
    vi.mocked(prisma.task.count).mockResolvedValue(0);
    vi.mocked(prisma.task.create).mockResolvedValue(mockTask);

    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: 'col_1',
        title: 'New task',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.task).toEqual(mockTask);
    expect(prisma.task.count).toHaveBeenCalledWith({
      where: { columnId: 'col_1' },
    });
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        columnId: 'col_1',
        title: 'New task',
        description: null,
        order: 0,
      },
    });
  });

  it('should create a task with title and description', async () => {
    const mockTask = {
      id: 'task_456',
      columnId: 'col_2',
      title: 'Task with description',
      description: 'This is a detailed description',
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.task.count).mockResolvedValue(3);
    vi.mocked(prisma.task.create).mockResolvedValue(mockTask);

    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: 'col_2',
        title: 'Task with description',
        description: 'This is a detailed description',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.task.description).toBe('This is a detailed description');
    expect(data.task.order).toBe(3);
  });

  it('should calculate correct order for new task', async () => {
    // Mock 5 existing tasks in column
    vi.mocked(prisma.task.count).mockResolvedValue(5);
    vi.mocked(prisma.task.create).mockResolvedValue({
      id: 'task_789',
      columnId: 'col_1',
      title: 'Sixth task',
      description: null,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: 'col_1',
        title: 'Sixth task',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.task.order).toBe(5);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        columnId: 'col_1',
        title: 'Sixth task',
        description: null,
        order: 5,
      },
    });
  });

  it('should return 400 for invalid request body', async () => {
    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: 'col_1',
        // Missing title
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.issues).toBeDefined();
  });

  it('should return 400 for title that is too long', async () => {
    const longTitle = 'a'.repeat(201); // Max is 200

    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: 'col_1',
        title: longTitle,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 for description that is too long', async () => {
    const longDescription = 'a'.repeat(1001); // Max is 1000

    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: 'col_1',
        title: 'Valid title',
        description: longDescription,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(prisma.task.count).mockRejectedValue(new Error('Database connection failed'));

    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: 'col_1',
        title: 'Test task',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
