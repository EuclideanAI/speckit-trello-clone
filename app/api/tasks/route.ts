import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { taskCreateSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * POST /api/tasks
 * 
 * Creates a new task in the specified column
 * Automatically calculates the order based on existing tasks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validated = taskCreateSchema.parse(body);
    const { columnId, title, description } = validated;

    // Calculate the order for the new task (append to end)
    const taskCount = await prisma.task.count({
      where: { columnId },
    });

    // Create the task
    const task = await prisma.task.create({
      data: {
        columnId,
        title,
        description: description || null,
        order: taskCount,
      },
    });

    return NextResponse.json(
      {
        message: 'Task created successfully',
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);

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
