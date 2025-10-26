'use client';

import { useState, useEffect } from 'react';
import { Column as PrismaColumn, Task } from '@prisma/client';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, X } from 'lucide-react';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColumnProps {
  column: PrismaColumn & {
    tasks: Task[];
  };
  onTaskCreated?: () => void;
  onTaskEdit?: (task: Task) => void;
}

/**
 * Column Component
 * 
 * Displays a column with header and list of tasks
 * Supports vertical scrolling for overflow content
 */
export function Column({ column, onTaskCreated, onTaskEdit }: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Listen for keyboard shortcut event
  useEffect(() => {
    const handleAddTaskShortcut = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Only respond if this is the first column
      if (customEvent.detail?.columnId === column.id) {
        setIsAddingTask(true);
        // Focus the input after it renders
        setTimeout(() => {
          const input = document.querySelector(`[data-column-id="${column.id}"] input`) as HTMLInputElement;
          if (input) {
            input.focus();
          }
        }, 0);
      }
    };

    window.addEventListener('add-task-shortcut', handleAddTaskShortcut);
    return () => window.removeEventListener('add-task-shortcut', handleAddTaskShortcut);
  }, [column.id]);
  
  // Defensive check
  if (!column) {
    return null;
  }

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks?.map((task) => task.id) || [];

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating task:', { columnId: column.id, title: newTaskTitle.trim() });
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: column.id,
          title: newTaskTitle.trim(),
          description: '',
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      console.log('Task created:', data);

      // Reset form
      setNewTaskTitle('');
      setIsAddingTask(false);
      
      // Force a full page reload to show the new task
      window.location.reload();
    } catch (error) {
      console.error('Error creating task:', error);
      setIsSubmitting(false);
      // TODO: Show error toast
    }
  };

  const handleCancel = () => {
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      data-testid="column"
      data-column-id={column.id}
      className="flex flex-col min-w-[280px] w-80"
      role="region"
      aria-label={`${column.name} column`}
    >
      {/* Column Container with grey background */}
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
        {/* Column Header */}
        <div className="mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
            {column.name}
            <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">
              {column.tasks?.length || 0}
            </span>
          </h2>
        </div>

        {/* Task List */}
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            data-testid="task-list"
            className="space-y-2 mb-2"
            role="list"
          >
            {!column.tasks || column.tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                No tasks yet
              </div>
            ) : (
              column.tasks.map((task) => (
                <div key={task.id} role="listitem">
                  <TaskCard task={task} onEdit={onTaskEdit} />
                </div>
              ))
            )}
          </div>
        </SortableContext>

        {/* Add Task Section */}
        {isAddingTask ? (
          <div className="space-y-2" role="form" aria-label="Add new task">
            <Input
              autoFocus
              placeholder="Enter a title or paste a link"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              className="bg-white dark:bg-gray-800 border-2 border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Task title"
              aria-required="true"
              aria-invalid={!newTaskTitle.trim() && newTaskTitle.length > 0 ? 'true' : 'false'}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddTask}
                disabled={isSubmitting || !newTaskTitle.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Add new task to column"
              >
                {isSubmitting ? 'Adding...' : 'Add card'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isSubmitting}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Cancel adding task"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label={`Add a new task to ${column.name} column`}
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add a card
          </Button>
        )}
      </div>
    </div>
  );
}
