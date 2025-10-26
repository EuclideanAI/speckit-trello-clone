import { Task } from '@prisma/client';

interface TaskCardProps {
  task: Task;
}

/**
 * TaskCard Component
 * 
 * Displays a single task card with title and optional description
 * Implements accessibility requirements for keyboard navigation
 */
export function TaskCard({ task }: TaskCardProps) {
  return (
    <div
      data-testid="task-card"
      tabIndex={0}
      className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
        {task.title}
      </h3>
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  );
}
