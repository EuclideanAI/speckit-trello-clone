import { Task } from '@prisma/client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

/**
 * TaskCard Component
 * 
 * Displays a single task card with title and optional description
 * Implements accessibility requirements for keyboard navigation
 * Shows edit button on hover with dark blue border
 */
export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking the edit button
    if ((e.target as HTMLElement).closest('[data-edit-button]')) {
      return;
    }
    onEdit?.(task);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="task-card"
      className={`group relative bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isHovered 
          ? 'border-2 border-blue-600 dark:border-blue-500' 
          : 'border border-gray-200 dark:border-gray-700'
      }`}
      aria-label={`Task: ${task.title}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      suppressHydrationWarning
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

      {/* Edit Button - Appears on hover */}
      {isHovered && (
        <button
          data-edit-button
          onClick={handleEditClick}
          className="absolute right-2 top-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Edit task"
          type="button"
        >
          <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      <div className="pl-6 pr-8">
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
