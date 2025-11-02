import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { taskUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * PATCH /api/tasks/[id]
 * 
 * Updates an existing task's title and/or description
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate request body
    const validated = taskUpdateSchema.parse(body);
    const { title, description } = validated;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Build update data object
    const updateData: { title?: string; description?: string | null } = {};
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);

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

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * 
 * Deletes an existing task permanently
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if ID is provided
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete the task
    const deletedTask = await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Task deleted successfully',
      task: deletedTask,
    });
  } catch (error) {
    console.error('Error deleting task:', error);

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
