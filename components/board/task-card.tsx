import { Task } from '@prisma/client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="task-card"
      className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={`Task: ${task.title}`}
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle Icon - Visual indicator only */}
      <div
        className="absolute left-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        aria-hidden="true"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <div className="pl-6">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}
