'use client';

import { Board as PrismaBoard, Column as PrismaColumn, Task } from '@prisma/client';
import { Column } from './column';

interface BoardProps {
  board: PrismaBoard & {
    columns: (PrismaColumn & {
      tasks: Task[];
    })[];
  };
}

/**
 * Board Component
 * 
 * Main Kanban board displaying columns with tasks
 * Supports horizontal scrolling on smaller screens
 */
export function Board({ board }: BoardProps) {
  return (
    <main
      data-testid="board"
      role="main"
      className="h-full px-6 py-8"
      aria-label="Kanban Board"
    >
      {/* Board Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {board.name}
        </h1>
      </div>

      {/* Columns Container - Horizontal Scrolling */}
      <div
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
        role="group"
        aria-label="Task columns"
      >
        {board.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>
    </main>
  );
}
