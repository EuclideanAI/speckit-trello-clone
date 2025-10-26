'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { EditTaskDialog } from './edit-task-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

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
  const router = useRouter();
  const [board, setBoard] = useState(initialBoard);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle task edit
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  // Handle task delete initiation
  const handleDeleteTask = (taskId: string) => {
    const task = board.columns
      .flatMap((col: any) => col.tasks)
      .find((t: any) => t.id === taskId);
    
    if (task) {
      setDeletingTask(task);
      setIsDeleteDialogOpen(true);
      // Close edit dialog if open
      setIsEditDialogOpen(false);
    }
  };

  // Confirm task deletion
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${deletingTask.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Close dialog and refresh board
      setIsDeleteDialogOpen(false);
      setDeletingTask(null);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save edited task
  const handleSaveTask = async (taskId: string, title: string, description: string | null) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Refresh the board to show updated task
      window.location.reload();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Keyboard shortcut to add new task (Ctrl/Cmd+N)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+N (Windows/Linux) or Cmd+N (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault(); // Prevent browser's default "New Window"
        
        // Trigger "Add a card" on the first column
        // Dispatch a custom event that the first Column component will listen to
        const addTaskEvent = new CustomEvent('add-task-shortcut', {
          detail: { columnId: board.columns[0]?.id },
        });
        window.dispatchEvent(addTaskEvent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board.columns]);

  // Refresh board data
  const refreshBoard = async () => {
    try {
      const response = await fetch('/api/board', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.board) {
          setBoard(data.board);
        }
      }
    } catch (error) {
      console.error('Error refreshing board:', error);
    }
  };

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
            <Column 
              key={column.id} 
              column={column} 
              onTaskCreated={refreshBoard}
              onTaskEdit={handleEditTask}
            />
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

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        taskTitle={deletingTask?.title || ''}
        isDeleting={isDeleting}
      />
    </DndContext>
  );
}
