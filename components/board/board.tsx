'use client';

import { useState } from 'react';
import { Board as PrismaBoard, Column as PrismaColumn, Task } from '@prisma/client';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Column } from './column';
import { TaskCard } from './task-card';

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
 * Supports drag-and-drop for task management
 */
export function Board({ board: initialBoard }: BoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag start
   * Store the task being dragged for overlay
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;

    // Find the task being dragged
    const task = board.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  };

  /**
   * Handle drag end
   * Update task position via API and optimistically update UI
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find source column and task
    const sourceColumn = board.columns.find((col) =>
      col.tasks.some((task) => task.id === taskId)
    );

    if (!sourceColumn) return;

    const task = sourceColumn.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine destination column (overId could be columnId or taskId)
    let destinationColumn = board.columns.find((col) => col.id === overId);
    
    if (!destinationColumn) {
      // If dropped on a task, find its column
      destinationColumn = board.columns.find((col) =>
        col.tasks.some((t) => t.id === overId)
      );
    }

    if (!destinationColumn) return;

    // Calculate new order
    let newOrder = 0;
    if (overId !== destinationColumn.id) {
      // Dropped on a task
      const overTaskIndex = destinationColumn.tasks.findIndex((t) => t.id === overId);
      newOrder = overTaskIndex >= 0 ? overTaskIndex : destinationColumn.tasks.length;
    } else {
      // Dropped on empty column
      newOrder = destinationColumn.tasks.length;
    }

    // Skip if no change
    if (sourceColumn.id === destinationColumn.id && task.order === newOrder) {
      return;
    }

    // Optimistic update
    const updatedBoard = { ...board };
    const updatedSourceColumn = updatedBoard.columns.find((c) => c.id === sourceColumn.id);
    const updatedDestColumn = updatedBoard.columns.find((c) => c.id === destinationColumn.id);

    if (updatedSourceColumn && updatedDestColumn) {
      // Remove from source
      updatedSourceColumn.tasks = updatedSourceColumn.tasks.filter((t) => t.id !== taskId);

      // Add to destination
      const updatedTask = { ...task, columnId: destinationColumn.id, order: newOrder };
      updatedDestColumn.tasks.splice(newOrder, 0, updatedTask);

      // Reorder tasks
      updatedDestColumn.tasks = updatedDestColumn.tasks.map((t, index) => ({
        ...t,
        order: index,
      }));

      setBoard(updatedBoard);
    }

    // Call API to persist changes
    try {
      const response = await fetch('/api/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          sourceColumnId: sourceColumn.id,
          destinationColumnId: destinationColumn.id,
          newOrder,
        }),
      });

      if (!response.ok) {
        // Rollback on error
        setBoard(initialBoard);
        console.error('Failed to reorder task');
      }
    } catch (error) {
      // Rollback on error
      setBoard(initialBoard);
      console.error('Error reordering task:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-80">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
