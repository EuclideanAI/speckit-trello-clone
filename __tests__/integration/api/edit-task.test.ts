/**
 * Integration Tests for PATCH /api/tasks/[id]
 * T086: Test API endpoint for updating tasks
 */

import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/tasks/[id]/route';
import { prisma } from '@/lib/db';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('PATCH /api/tasks/[id] - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const mockTask = {
    id: 'task-1',
    title: 'Original Title',
    description: 'Original description',
    columnId: 'col-1',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  test('should update task title successfully', async () => {
    const updatedTask = {
      ...mockTask,
      title: 'Updated Title',
      updatedAt: new Date(),
    };

    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.update.mockResolvedValue(updatedTask);

    const request = createMockRequest({
      title: 'Updated Title',
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.task.title).toBe('Updated Title');
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { title: 'Updated Title' },
    });
  });

  test('should update task description successfully', async () => {
    const updatedTask = {
      ...mockTask,
      description: 'New description text',
      updatedAt: new Date(),
    };

    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.update.mockResolvedValue(updatedTask);

    const request = createMockRequest({
      description: 'New description text',
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.task.description).toBe('New description text');
  });

  test('should update both title and description', async () => {
    const updatedTask = {
      ...mockTask,
      title: 'New Title',
      description: 'New description',
      updatedAt: new Date(),
    };

    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.update.mockResolvedValue(updatedTask);

    const request = createMockRequest({
      title: 'New Title',
      description: 'New description',
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.task.title).toBe('New Title');
    expect(data.task.description).toBe('New description');
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: {
        title: 'New Title',
        description: 'New description',
      },
    });
  });

  test('should allow empty description', async () => {
    const updatedTask = {
      ...mockTask,
      description: null,
      updatedAt: new Date(),
    };

    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.update.mockResolvedValue(updatedTask);

    const request = createMockRequest({
      title: 'Title',
      description: '',
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: {
        title: 'Title',
        description: '',
      },
    });
  });

  test('should return 400 when title is empty', async () => {
    const request = createMockRequest({
      title: '',
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(mockPrisma.task.update).not.toHaveBeenCalled();
  });

  test('should return 400 when title is missing', async () => {
    const request = createMockRequest({
      description: 'Some description',
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  test('should return 400 when title is too long', async () => {
    const longTitle = 'A'.repeat(101);
    
    const request = createMockRequest({
      title: longTitle,
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(mockPrisma.task.update).not.toHaveBeenCalled();
  });

  test('should return 400 when description is too long', async () => {
    const longDescription = 'A'.repeat(501);
    
    const request = createMockRequest({
      title: 'Valid Title',
      description: longDescription,
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  test('should return 404 when task does not exist', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(null);

    const request = createMockRequest({
      title: 'Updated Title',
    });

    const response = await PATCH(request, { params: { id: 'nonexistent' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Task not found');
    expect(mockPrisma.task.update).not.toHaveBeenCalled();
  });

  test('should return 500 on database error', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.update.mockRejectedValue(new Error('Database error'));

    const request = createMockRequest({
      title: 'Updated Title',
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  test('should trim whitespace from title', async () => {
    const updatedTask = {
      ...mockTask,
      title: 'Trimmed Title',
      updatedAt: new Date(),
    };

    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.update.mockResolvedValue(updatedTask);

    const request = createMockRequest({
      title: '  Trimmed Title  ',
    });

    const response = await PATCH(request, { params: { id: 'task-1' } });

    expect(response.status).toBe(200);
    // Should trim the title before updating
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { title: expect.stringMatching(/^Trimmed Title$/) },
    });
  });
});
