'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  taskTitle: string;
  isDeleting?: boolean;
}

/**
 * DeleteConfirmDialog Component
 * 
 * Confirmation dialog for deleting tasks
 * Shows warning message and requires explicit confirmation
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  taskTitle,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isDeleting) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape' && !isDeleting) {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Delete Task?
            </DialogTitle>
          </div>
          <DialogDescription className="pt-3 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">"{taskTitle}"</span>?
            <br />
            <span className="text-red-600 dark:text-red-400 font-medium">
              This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            autoFocus
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
