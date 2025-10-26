import { Column as PrismaColumn, Task } from '@prisma/client';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './task-card';

interface ColumnProps {
  column: PrismaColumn & {
    tasks: Task[];
  };
}

/**
 * Column Component
 * 
 * Displays a column with header and list of tasks
 * Supports vertical scrolling for overflow content
 */
export function Column({ column }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div
      data-testid="column"
      className="flex flex-col bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[280px] w-80 max-h-[calc(100vh-12rem)]"
      role="region"
      aria-label={`${column.name} column`}
    >
      {/* Column Header */}
      <div className="mb-3">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
          {column.name}
          <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">
            {column.tasks.length}
          </span>
        </h2>
      </div>

      {/* Task List */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          data-testid="task-list"
          className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
          role="list"
        >
          {column.tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
              No tasks yet
            </div>
          ) : (
            column.tasks.map((task) => (
              <div key={task.id} role="listitem">
                <TaskCard task={task} />
              </div>
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
