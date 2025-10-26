import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { taskReorderSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * PATCH /api/tasks/reorder
 * 
 * Handles task reordering and moving between columns
 * Uses Prisma transactions for atomicity
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validated = taskReorderSchema.parse(body);
    const { taskId, sourceColumnId, destinationColumnId, newOrder } = validated;

    // Use transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // Get the task first
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Simplified approach: just update the task's order and column
      // We don't need to maintain sequential orders (0,1,2,3...)
      // Just need relative ordering, so we can use any numbers
      // Use a temporary timestamp-based order to avoid conflicts during update
      const tempOrder = Date.now();
      
      // Step 1: Move to temporary order to avoid unique constraint conflicts
      await tx.task.update({
        where: { id: taskId },
        data: { order: tempOrder },
      });

      // Step 2: Update to final position
      const movedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          columnId: destinationColumnId,
          order: newOrder,
        },
      });

      return movedTask;
    });

    return NextResponse.json({
      message: 'Task reordered successfully',
      task: result,
    });
  } catch (error) {
    console.error('Error reordering task:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle task not found
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
