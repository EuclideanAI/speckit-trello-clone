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
    
    console.log('Reorder request received:', body);
    
    // Validate request body
    const validated = taskReorderSchema.parse(body);
    const { taskId, sourceColumnId, destinationColumnId, newOrder } = validated;

    console.log('Validated data:', { taskId, sourceColumnId, destinationColumnId, newOrder });

    // Use transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // Get the task first
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const isSameColumn = sourceColumnId === destinationColumnId;

      if (isSameColumn) {
        // Reordering within the same column
        const tasksInColumn = await tx.task.findMany({
          where: { columnId: sourceColumnId },
          orderBy: { order: 'asc' },
        });

        // Create new order mapping
        const taskOrder = tasksInColumn.filter((t: any) => t.id !== taskId);
        taskOrder.splice(newOrder, 0, task);

        // First, move all tasks to temporary negative orders to avoid conflicts
        for (let i = 0; i < taskOrder.length; i++) {
          await tx.task.update({
            where: { id: taskOrder[i].id },
            data: { order: -(i + 1) },
          });
        }

        // Then update to final positive orders
        for (let i = 0; i < taskOrder.length; i++) {
          await tx.task.update({
            where: { id: taskOrder[i].id },
            data: { order: i },
          });
        }
      } else {
        // Moving to a different column
        
        // Step 1: Move the task to destination column with a temporary order
        await tx.task.update({
          where: { id: taskId },
          data: { 
            columnId: destinationColumnId,
            order: 999999, // Temporary high order to avoid conflicts
          },
        });

        // Step 2: Reorder source column
        const sourceColumnTasks = await tx.task.findMany({
          where: { columnId: sourceColumnId },
          orderBy: { order: 'asc' },
        });

        for (let i = 0; i < sourceColumnTasks.length; i++) {
          await tx.task.update({
            where: { id: sourceColumnTasks[i].id },
            data: { order: i },
          });
        }

        // Step 3: Reorder destination column with the new task
        const destColumnTasks = await tx.task.findMany({
          where: { columnId: destinationColumnId },
          orderBy: { order: 'asc' },
        });

        // Create the final order with the moved task at the correct position
        const finalOrder = destColumnTasks.filter((t: any) => t.id !== taskId);
        const movedTask = destColumnTasks.find((t: any) => t.id === taskId);
        if (movedTask) {
          finalOrder.splice(newOrder, 0, movedTask);
        }

        // IMPORTANT: Avoid unique (columnId, order) collisions while reindexing.
        // First move all tasks in destination column to temporary negative orders,
        // then set their final sequential orders. This guarantees no duplicates.
        for (let i = 0; i < finalOrder.length; i++) {
          await tx.task.update({
            where: { id: finalOrder[i].id },
            data: { order: -(i + 1) },
          });
        }

        for (let i = 0; i < finalOrder.length; i++) {
          await tx.task.update({
            where: { id: finalOrder[i].id },
            data: { order: i },
          });
        }
      }

      // Return the updated task
      return await tx.task.findUnique({
        where: { id: taskId },
      });
    });

    return NextResponse.json({
      message: 'Task reordered successfully',
      task: result,
    });
  } catch (error) {
    console.error('Error reordering task:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
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
      console.error('Task not found error');
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
