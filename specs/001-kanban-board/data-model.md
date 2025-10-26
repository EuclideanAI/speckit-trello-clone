# Data Model: Kanban Board

**Feature**: Kanban Board Project Management Tool  
**Date**: 2025-10-26  
**Status**: Complete

## Overview

This document defines the data model for the Kanban board feature, including entity relationships, field specifications, and Prisma schema implementation.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     Board       │
│─────────────────│
│ id: String (PK) │
│ name: String    │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐
│     Column      │
│─────────────────│
│ id: String (PK) │
│ boardId (FK)    │
│ name: String    │
│ order: Int      │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐
│      Task       │
│─────────────────│
│ id: String (PK) │
│ columnId (FK)   │
│ title: String   │
│ description     │
│ order: Int      │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

---

## Entity Specifications

### 1. Board

**Purpose**: Represents the overall Kanban board workspace containing columns and tasks.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | Primary Key, CUID | Unique identifier |
| name | String | Required | Board name/title |
| createdAt | DateTime | Auto-generated | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Relationships**:
- Has many `Column` (1:N)

**Business Rules**:
- BR-001: One board per application instance (MVP constraint)
- BR-002: Board name defaults to "My Kanban Board"
- BR-003: Deleting board cascades to all columns and tasks

**Validation Rules**:
- VR-001: Board name must be 1-100 characters
- VR-002: Board name cannot be empty or only whitespace

---

### 2. Column

**Purpose**: Represents a workflow stage or status category containing tasks.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | Primary Key, CUID | Unique identifier |
| boardId | String | Foreign Key, Required | Reference to parent board |
| name | String | Required | Column name (e.g., "To Do") |
| order | Int | Required, Unique per board | Position in board (0-based) |
| createdAt | DateTime | Auto-generated | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Relationships**:
- Belongs to `Board` (N:1)
- Has many `Task` (1:N)

**Indexes**:
- Composite unique index on `(boardId, order)`
- Index on `boardId` for query optimization

**Business Rules**:
- BR-004: Default columns are "To Do" (order: 0), "In Progress" (order: 1), "Done" (order: 2)
- BR-005: Column order must be sequential (0, 1, 2, ...)
- BR-006: Deleting column cascades to all contained tasks

**Validation Rules**:
- VR-003: Column name must be 1-50 characters
- VR-004: Column order must be non-negative integer
- VR-005: No duplicate order values within same board

**State Transitions**:
- None (columns are static for MVP)

---

### 3. Task

**Purpose**: Represents a work item or activity within a column.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | Primary Key, CUID | Unique identifier |
| columnId | String | Foreign Key, Required | Reference to parent column |
| title | String | Required | Task title/name |
| description | String | Optional, Nullable | Task details/notes |
| order | Int | Required, Unique per column | Position in column (0-based) |
| createdAt | DateTime | Auto-generated | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Relationships**:
- Belongs to `Column` (N:1)

**Indexes**:
- Composite unique index on `(columnId, order)`
- Index on `columnId` for query optimization

**Business Rules**:
- BR-007: New tasks default to bottom of column (max order + 1)
- BR-008: Task order must be sequential within column (0, 1, 2, ...)
- BR-009: Moving task to new column updates both columnId and order
- BR-010: Deleting task reorders remaining tasks in same column

**Validation Rules**:
- VR-006: Task title must be 1-200 characters
- VR-007: Task title cannot be empty or only whitespace
- VR-008: Task description maximum 1000 characters (optional)
- VR-009: Task order must be non-negative integer
- VR-010: No duplicate order values within same column

**State Transitions**:
```
Created → [Column A, Order N] → Moved → [Column B, Order M] → Deleted
                               ↓
                           Reordered → [Column A, Order X]
```

---

## Prisma Schema

**File**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Board {
  id        String   @id @default(cuid())
  name      String   @default("My Kanban Board")
  columns   Column[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Column {
  id        String   @id @default(cuid())
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  name      String
  order     Int
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([boardId, order])
  @@index([boardId])
}

model Task {
  id          String   @id @default(cuid())
  columnId    String
  column      Column   @relation(fields: [columnId], references: [id], onDelete: Cascade)
  title       String
  description String?
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([columnId, order])
  @@index([columnId])
}
```

---

## Database Operations

### Common Queries

**1. Get Board with All Columns and Tasks**:
```typescript
const board = await prisma.board.findFirst({
  include: {
    columns: {
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        }
      }
    }
  }
});
```

**2. Create Task in Column**:
```typescript
// Get max order in column
const maxOrder = await prisma.task.aggregate({
  where: { columnId },
  _max: { order: true }
});

// Create task at end of column
const task = await prisma.task.create({
  data: {
    columnId,
    title,
    description,
    order: (maxOrder._max.order ?? -1) + 1
  }
});
```

**3. Move Task to Different Column**:
```typescript
await prisma.$transaction(async (tx) => {
  // Get max order in destination column
  const maxOrder = await tx.task.aggregate({
    where: { columnId: newColumnId },
    _max: { order: true }
  });

  // Move task
  await tx.task.update({
    where: { id: taskId },
    data: {
      columnId: newColumnId,
      order: (maxOrder._max.order ?? -1) + 1
    }
  });
});
```

**4. Reorder Task Within Column**:
```typescript
await prisma.$transaction(async (tx) => {
  // Get all tasks in column
  const tasks = await tx.task.findMany({
    where: { columnId },
    orderBy: { order: 'asc' }
  });

  // Remove task from current position
  const [movedTask] = tasks.splice(oldIndex, 1);
  
  // Insert at new position
  tasks.splice(newIndex, 0, movedTask);

  // Update all order values
  await Promise.all(
    tasks.map((task, index) =>
      tx.task.update({
        where: { id: task.id },
        data: { order: index }
      })
    )
  );
});
```

**5. Delete Task and Reorder**:
```typescript
await prisma.$transaction(async (tx) => {
  const task = await tx.task.delete({
    where: { id: taskId }
  });

  // Reorder remaining tasks in same column
  await tx.task.updateMany({
    where: {
      columnId: task.columnId,
      order: { gt: task.order }
    },
    data: {
      order: { decrement: 1 }
    }
  });
});
```

---

## Seed Data

**File**: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create board
  const board = await prisma.board.create({
    data: {
      name: 'My Kanban Board'
    }
  });

  // Create columns
  const toDo = await prisma.column.create({
    data: {
      boardId: board.id,
      name: 'To Do',
      order: 0
    }
  });

  const inProgress = await prisma.column.create({
    data: {
      boardId: board.id,
      name: 'In Progress',
      order: 1
    }
  });

  const done = await prisma.column.create({
    data: {
      boardId: board.id,
      name: 'Done',
      order: 2
    }
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      { columnId: toDo.id, title: 'Setup project structure', order: 0 },
      { columnId: toDo.id, title: 'Design database schema', order: 1 },
      { columnId: toDo.id, title: 'Implement drag and drop', order: 2 },
      { columnId: inProgress.id, title: 'Create task components', description: 'Build TaskCard, TaskForm components', order: 0 },
      { columnId: inProgress.id, title: 'Setup Prisma and database', order: 1 },
      { columnId: done.id, title: 'Initialize Next.js project', description: 'Setup Next.js 15 with TypeScript', order: 0 },
      { columnId: done.id, title: 'Install dependencies', order: 1 }
    ]
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Migration Strategy

**Initial Migration**:
```bash
npx prisma migrate dev --name init
```

**Future Schema Changes**:
1. Modify `schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Test migration on development database
4. Review generated SQL
5. Apply to production with `npx prisma migrate deploy`

**Rollback Strategy**:
- Keep migrations in version control
- Use Prisma's migration history
- Manual rollback if needed via SQL

---

## Type Definitions

**Generated Types** (from Prisma):
```typescript
// Automatically available after `npx prisma generate`
import { Board, Column, Task } from '@prisma/client';

// With relations
type BoardWithColumns = Board & {
  columns: (Column & {
    tasks: Task[];
  })[];
};
```

**Custom Types** (`lib/types.ts`):
```typescript
export type TaskFormData = {
  title: string;
  description?: string;
};

export type TaskMovePayload = {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  newOrder: number;
};

export type TaskReorderPayload = {
  taskId: string;
  columnId: string;
  newOrder: number;
};
```

---

## Validation Schemas

**Using Zod** (`lib/validations.ts`):
```typescript
import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .nullable()
});

export const taskMoveSchema = z.object({
  taskId: z.string().cuid(),
  sourceColumnId: z.string().cuid(),
  destinationColumnId: z.string().cuid(),
  newOrder: z.number().int().nonnegative()
});

export type TaskFormData = z.infer<typeof taskSchema>;
export type TaskMovePayload = z.infer<typeof taskMoveSchema>;
```

---

## Performance Considerations

1. **Indexes**: Composite indexes on `(boardId, order)` and `(columnId, order)` for fast ordering
2. **Cascading Deletes**: Use `onDelete: Cascade` for automatic cleanup
3. **Transactions**: Use Prisma transactions for multi-step operations (move, reorder, delete)
4. **Batching**: Use `createMany` and `updateMany` for bulk operations
5. **Query Optimization**: Include only needed relations, avoid N+1 queries

**Query Performance Targets**:
- Board load (with all data): <50ms
- Task create: <20ms
- Task move/reorder: <30ms
- Task delete: <25ms

---

## Summary

The data model supports all functional requirements from the specification:
- ✅ FR-001, FR-002: Board and task display structure
- ✅ FR-003-FR-006: Drag-and-drop with position tracking
- ✅ FR-007-FR-011: Task creation with validation
- ✅ FR-012-FR-015: Task editing
- ✅ FR-016-FR-018: Task deletion with cleanup
- ✅ FR-025: Order field enables efficient scrolling

The schema is normalized, indexed, and optimized for the expected query patterns.
