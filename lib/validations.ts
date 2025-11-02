import { z } from 'zod';

/**
 * Task form validation schema
 * Validates task title and description
 */
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .nullable(),
});

/**
 * Task creation input schema
 * Extends taskSchema with columnId
 */
export const taskCreateSchema = taskSchema.extend({
  columnId: z.string().cuid('Invalid column ID'),
});

/**
 * Task update input schema
 * Similar to taskSchema but with optional fields
 */
export const taskUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .nullable(),
}).refine(
  (data) => data.title !== undefined || data.description !== undefined,
  'At least one field (title or description) must be provided'
);

/**
 * Task move/reorder input schema
 * Validates drag-and-drop operations
 */
export const taskReorderSchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
  sourceColumnId: z.string().cuid('Invalid source column ID'),
  destinationColumnId: z.string().cuid('Invalid destination column ID'),
  newOrder: z.number().int().nonnegative('Order must be non-negative'),
});

// Type exports for use in components
export type TaskFormData = z.infer<typeof taskSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskReorderInput = z.infer<typeof taskReorderSchema>;
