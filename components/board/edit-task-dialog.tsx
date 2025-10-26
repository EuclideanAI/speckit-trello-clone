'use client';

import { useState, useEffect } from 'react';
import { Task } from '@prisma/client';
import { X, Tag, Clock, CheckSquare, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskId: string, title: string, description: string | null) => Promise<void>;
}

/**
 * EditTaskDialog Component
 * 
 * Modal dialog for editing task title and description
 * Matches Trello's design with placeholder buttons for future features
 */
export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onSave,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setError('');
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 100) {
      setError('Title must be 100 characters or less');
      return;
    }

    if (description.length > 500) {
      setError('Description must be 500 characters or less');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(task.id, title.trim(), description.trim() || null);
      onOpenChange(false);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error('Error saving task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
    setError('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0"
        onKeyDown={handleKeyDown}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          Edit Task: {task.title}
        </DialogTitle>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Task Title (editable) */}
          <div className="mb-6">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex-1">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Task title"
                  aria-label="Task title"
                  autoFocus
                />
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  in list <span className="font-medium">Done</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr,auto] gap-6">
            {/* Main content area */}
            <div className="space-y-6">
              {/* Description Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm">Description</h3>
                </div>
                <div className="ml-8">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="min-h-[100px] resize-y"
                    aria-label="Task description"
                  />
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {error}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      disabled={isSaving}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments placeholder */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm">Comments and activity</h3>
                </div>
                <div className="ml-8">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span>Show details</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar with action buttons (placeholders) */}
            <div className="w-44 space-y-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Add to card
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm font-normal"
                disabled
              >
                <Tag className="h-4 w-4 mr-2" />
                Labels
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm font-normal"
                disabled
              >
                <Clock className="h-4 w-4 mr-2" />
                Dates
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm font-normal"
                disabled
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm font-normal"
                disabled
              >
                <User className="h-4 w-4 mr-2" />
                Members
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
