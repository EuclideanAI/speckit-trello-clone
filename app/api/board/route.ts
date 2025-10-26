import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/board
 * 
 * Fetches the board with all columns and tasks
 * Returns board data ordered by column order and task order
 */
export async function GET() {
  try {
    const board = await prisma.board.findFirst({
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

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
