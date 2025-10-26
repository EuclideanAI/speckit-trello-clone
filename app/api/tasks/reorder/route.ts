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

      // Moving to a different column
      if (sourceColumnId !== destinationColumnId) {
        // Step 1: Move the task to a temporary order to avoid conflicts
        await tx.task.update({
          where: { id: taskId },
          data: { order: 99999 },
        });

        // Step 2: Reorder tasks in source column (shift down tasks after removed task)
        await tx.task.updateMany({
          where: {
            columnId: sourceColumnId,
            order: { gt: task.order },
          },
          data: {
            order: { decrement: 1 },
          },
        });

        // Step 3: Reorder tasks in destination column (shift up tasks to make space)
        await tx.task.updateMany({
          where: {
            columnId: destinationColumnId,
            order: { gte: newOrder },
          },
          data: {
            order: { increment: 1 },
          },
        });

        // Step 4: Update the moved task to its final position
        const movedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            columnId: destinationColumnId,
            order: newOrder,
          },
        });

        return movedTask;
      } 
      // Reordering within same column
      else {
        const currentOrder = task.order;

        // Skip if no change needed
        if (currentOrder === newOrder) {
          return task;
        }

        // Step 1: Move the task to a temporary order to avoid conflicts
        // Use a very high number that won't conflict
        await tx.task.update({
          where: { id: taskId },
          data: { order: 99999 },
        });

        // Step 2: Shift other tasks
        // Moving up (to lower order number)
        if (newOrder < currentOrder) {
          // Shift tasks down that are between newOrder and currentOrder
          await tx.task.updateMany({
            where: {
              columnId: sourceColumnId,
              order: {
                gte: newOrder,
                lt: currentOrder,
              },
            },
            data: {
              order: { increment: 1 },
            },
          });
        }
        // Moving down (to higher order number)
        else if (newOrder > currentOrder) {
          // Shift tasks up that are between currentOrder and newOrder
          await tx.task.updateMany({
            where: {
              columnId: sourceColumnId,
              order: {
                gt: currentOrder,
                lte: newOrder,
              },
            },
            data: {
              order: { decrement: 1 },
            },
          });
        }

        // Step 3: Update the moved task to its final position
        const movedTask = await tx.task.update({
          where: { id: taskId },
          data: { order: newOrder },
        });

        return movedTask;
      }
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
