/**
 * Integration Tests for DELETE /api/tasks/[id]
 * T103: Test API endpoint for deleting tasks
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE } from '@/app/api/tasks/[id]/route';
import { prisma } from '@/lib/db';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    task: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

describe('DELETE /api/tasks/[id] - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = () => {
    return new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'DELETE',
    });
  };

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test description',
    columnId: 'col-1',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  test('should delete task successfully', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.delete.mockResolvedValue(mockTask);

    const request = createMockRequest();
    const response = await DELETE(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Task deleted successfully');
    expect(mockPrisma.task.delete).toHaveBeenCalledWith({
      where: { id: 'task-1' },
    });
  });

  test('should return deleted task data', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.delete.mockResolvedValue(mockTask);

    const request = createMockRequest();
    const response = await DELETE(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.task).toEqual(expect.objectContaining({
      id: 'task-1',
      title: 'Test Task',
    }));
  });

  test('should return 404 when task does not exist', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(null);

    const request = createMockRequest();
    const response = await DELETE(request, { params: { id: 'nonexistent' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Task not found');
    expect(mockPrisma.task.delete).not.toHaveBeenCalled();
  });

  test('should return 500 on database error', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.delete.mockRejectedValue(new Error('Database error'));

    const request = createMockRequest();
    const response = await DELETE(request, { params: { id: 'task-1' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  test('should handle missing task ID parameter', async () => {
    const request = createMockRequest();
    
    // Test with empty ID
    const response = await DELETE(request, { params: { id: '' } });
    
    // Should either return 404 or 400
    expect([400, 404]).toContain(response.status);
  });

  test('should verify task exists before deletion', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(mockTask);
    mockPrisma.task.delete.mockResolvedValue(mockTask);

    const request = createMockRequest();
    await DELETE(request, { params: { id: 'task-1' } });

    // Should check if task exists first
    expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 'task-1' },
    });
    
    // Then delete it
    expect(mockPrisma.task.delete).toHaveBeenCalledWith({
      where: { id: 'task-1' },
    });
  });

  test('should handle concurrent deletion attempts', async () => {
    // First call succeeds
    mockPrisma.task.findUnique.mockResolvedValueOnce(mockTask);
    mockPrisma.task.delete.mockResolvedValueOnce(mockTask);

    const request1 = createMockRequest();
    const response1 = await DELETE(request1, { params: { id: 'task-1' } });
    expect(response1.status).toBe(200);

    // Second call should fail (task already deleted)
    mockPrisma.task.findUnique.mockResolvedValueOnce(null);

    const request2 = createMockRequest();
    const response2 = await DELETE(request2, { params: { id: 'task-1' } });
    expect(response2.status).toBe(404);
  });
});
