---
description: "Task list for Kanban Board Project Management Tool implementation"
---

# Tasks: Kanban Board Project Management Tool

**Input**: Design documents from `/specs/001-kanban-board/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Per Constitution Principle II, TDD is MANDATORY. All test tasks must be completed BEFORE implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- Next.js 15 App Router: `app/`, `components/`, `lib/` at repository root
- Paths assume full-stack Next.js structure per plan.md

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js 15 project with required dependencies and configuration

- [X] T001 Initialize Next.js 15 project with TypeScript using `npx create-next-app@15`
- [X] T002 [P] Install core dependencies: prisma, @prisma/client, @dnd-kit/core, @dnd-kit/sortable, lucide-react
- [X] T003 [P] Install dev dependencies: vitest, @testing-library/react, @testing-library/jest-dom, playwright
- [X] T004 [P] Initialize shadcn/ui with `npx shadcn-ui@latest init` and configure components.json
- [X] T005 [P] Install shadcn/ui components: card, button, dialog, input, textarea, form, label, scroll-area
- [X] T006 [P] Create .env.local file with DATABASE_URL="file:./dev.db"
- [X] T007 [P] Configure next.config.js for production optimizations
- [X] T008 [P] Configure tailwind.config.ts with custom theme and shadcn/ui presets
- [X] T009 [P] Configure tsconfig.json with path aliases (@/*)
- [X] T010 [P] Create vitest.config.ts for unit test configuration
- [X] T011 [P] Create playwright.config.ts for E2E test configuration
- [X] T012 [P] Setup ESLint and Prettier configurations
- [X] T013 [P] Create .gitignore entries for dev.db, .env.local, node_modules

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T014 Create Prisma schema in prisma/schema.prisma with Board, Column, Task models
- [X] T015 Generate Prisma client with `npx prisma generate`
- [X] T016 Create initial database migration with `npx prisma migrate dev --name init`
- [X] T017 Create seed script in prisma/seed.ts with sample board, 3 columns, and 7 tasks
- [X] T018 Run seed script with `npx prisma db seed`
- [X] T019 [P] Create Prisma client singleton in lib/db.ts
- [X] T020 [P] Create Zod validation schemas in lib/validations.ts (taskSchema, taskMoveSchema, taskReorderSchema)
- [X] T021 [P] Create utility functions in lib/utils.ts (cn helper from shadcn/ui)
- [X] T022 [P] Create app/globals.css with Tailwind directives and CSS variables
- [X] T023 Create app/layout.tsx with root HTML structure, metadata, and font configuration
- [X] T024 [P] Setup test utilities in __tests__/setup.ts for Vitest and RTL
- [X] T025 [P] Create mock Prisma client in __tests__/mocks/prisma.ts for testing

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Organize Tasks (Priority: P1) 🎯 MVP

**Goal**: Display board with tasks organized in columns, enabling users to see project status at a glance

**Independent Test**: Load board with pre-populated tasks across 3 columns and verify all tasks display correctly in their respective columns

### Tests for User Story 1 (MANDATORY per Constitution) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T026 [P] [US1] Create E2E test in __tests__/e2e/board.spec.ts for loading board with tasks
- [X] T027 [P] [US1] Create E2E test for empty board display with column placeholders
- [X] T028 [P] [US1] Create E2E test for scrollable columns with many tasks
- [X] T029 [P] [US1] Create integration test in __tests__/integration/api/board.test.ts for GET /api/board
- [X] T030 [P] [US1] Create unit test in __tests__/unit/components/board.test.tsx for Board component rendering

### Implementation for User Story 1

- [X] T031 [P] [US1] Create GET /api/board route in app/api/board/route.ts to fetch board with columns and tasks
- [X] T032 [P] [US1] Create Board component in components/board/board.tsx with horizontal column layout
- [X] T033 [P] [US1] Create Column component in components/board/column.tsx with header and task list
- [X] T034 [P] [US1] Create TaskCard component in components/board/task-card.tsx with title and description display
- [X] T035 [US1] Create main page in app/page.tsx that fetches and displays board
- [X] T036 [US1] Add loading.tsx in app/ for Suspense boundary during board fetch
- [X] T037 [US1] Add error.tsx in app/ for error boundary handling
- [X] T038 [P] [US1] Style Board component with Tailwind for responsive horizontal scrolling
- [X] T039 [P] [US1] Style Column component with Tailwind for fixed width and vertical scrolling
- [X] T040 [P] [US1] Style TaskCard component with Tailwind for card appearance and hover states
- [X] T041 [US1] Add empty state messaging when columns have no tasks
- [X] T042 [US1] Test responsive design on mobile viewport (columns stack or horizontal scroll)

**Checkpoint**: User Story 1 complete - board displays tasks organized by column ✅

---

## Phase 4: User Story 2 - Drag and Drop Tasks (Priority: P2)

**Goal**: Enable drag-and-drop interaction for moving tasks between columns and reordering within columns

**Independent Test**: Drag task from "To Do" to "In Progress" and verify it appears in new column

### Tests for User Story 2 (MANDATORY per Constitution) ⚠️

- [X] T043 [P] [US2] Create E2E test for dragging task between columns
- [X] T044 [P] [US2] Create E2E test for reordering task within same column
- [X] T045 [P] [US2] Create E2E test for invalid drop (task returns to origin)
- [X] T046 [P] [US2] Create E2E test for visual feedback during drag
- [X] T047 [P] [US2] Create integration test for PATCH /api/tasks/reorder endpoint
- [X] T048 [P] [US2] Create unit test for drag-and-drop hook logic

### Implementation for User Story 2

- [X] T049 [P] [US2] Create PATCH /api/tasks/reorder route in app/api/tasks/reorder/route.ts
- [X] T050 [P] [US2] Implement reorder logic with Prisma transaction for atomicity
- [X] T051 [US2] Install and configure @dnd-kit/core and @dnd-kit/sortable packages
- [X] T052 [US2] Wrap Board component with DndContext from @dnd-kit
- [X] T053 [US2] Make Column component a SortableContext for its tasks
- [X] T054 [US2] Make TaskCard component use useSortable hook for drag behavior
- [X] T055 [US2] Implement onDragEnd handler in Board to update task positions
- [X] T056 [US2] Add optimistic UI updates using React's useOptimistic hook
- [X] T057 [P] [US2] Add DragOverlay component for visual drag feedback
- [X] T058 [P] [US2] Style drag placeholder and drop zone highlights with Tailwind
- [X] T059 [P] [US2] Add drag handle icon from Lucide React to task cards
- [X] T060 [US2] Implement keyboard navigation for drag-and-drop (accessibility requirement)
- [X] T061 [US2] Add ARIA live regions for screen reader announcements during drag
- [X] T062 [US2] Test touch-based drag and drop on mobile devices

**Checkpoint**: User Story 2 complete - drag-and-drop fully functional ✅

---

## Phase 5: User Story 3 - Create New Tasks (Priority: P3)

**Goal**: Allow users to add new task cards to any column

**Independent Test**: Click "Add Task" button, fill form, submit, and verify new card appears in column

### Tests for User Story 3 (MANDATORY per Constitution) ⚠️

- [X] T063 [P] [US3] Create E2E test for creating task with title only
- [X] T064 [P] [US3] Create E2E test for creating task with title and description
- [X] T065 [P] [US3] Create E2E test for validation error when title is empty
- [X] T066 [P] [US3] Create integration test for POST /api/tasks endpoint
- [X] T067 [P] [US3] Create unit test for TaskForm component validation

### Implementation for User Story 3

- [X] T068 [P] [US3] Create POST /api/tasks route in app/api/tasks/route.ts
- [X] T069 [P] [US3] Implement task creation logic with order calculation
- [X] T070 [P] [US3] Create TaskForm component in components/board/task-form.tsx with react-hook-form
- [X] T071 [P] [US3] Add Zod schema integration to TaskForm for validation
- [X] T072 [US3] Add "Add Task" button to Column component
- [X] T073 [US3] Implement Dialog from shadcn/ui to show TaskForm
- [X] T074 [US3] Add form fields: Input for title, Textarea for description
- [X] T075 [US3] Add form validation error messages
- [X] T076 [US3] Implement form submission that calls POST /api/tasks
- [X] T077 [US3] Add optimistic UI update to show new task immediately
- [X] T078 [US3] Implement error handling and display error toasts
- [X] T079 [P] [US3] Style TaskForm with Tailwind for consistent appearance
- [X] T080 [US3] Add keyboard shortcut (e.g., Ctrl+N) to open new task form
- [X] T081 [US3] Test form accessibility (labels, focus management, screen reader)

**Checkpoint**: User Story 3 complete - users can create tasks ✅

---

## Phase 6: User Story 4 - Edit Existing Tasks (Priority: P4)

**Goal**: Allow users to modify task title and description

**Independent Test**: Click task card, edit content, save, and verify updates appear on card

### Tests for User Story 4 (MANDATORY per Constitution) ⚠️

- [X] T082 [P] [US4] Create E2E test for editing task title
- [X] T083 [P] [US4] Create E2E test for editing task description
- [X] T084 [P] [US4] Create E2E test for canceling edit without saving
- [X] T085 [P] [US4] Create E2E test for validation error when clearing title
- [X] T086 [P] [US4] Create integration test for PATCH /api/tasks/:id endpoint
- [ ] T087 [P] [US4] Create unit test for edit form validation

### Implementation for User Story 4

- [X] T088 [P] [US4] Create PATCH /api/tasks/:id route in app/api/tasks/[id]/route.ts
- [X] T089 [P] [US4] Implement task update logic with validation
- [X] T090 [US4] Make TaskCard clickable to open edit dialog
- [X] T091 [US4] Create EditTaskDialog component with Trello-style layout
- [X] T092 [US4] Add hover effect with dark blue border and pencil icon
- [X] T093 [US4] Populate form fields with existing task data in edit mode
- [X] T094 [US4] Implement save handler that calls PATCH /api/tasks/:id
- [X] T095 [US4] Add cancel button that closes dialog without saving
- [X] T096 [US4] Add full page refresh after saving changes
- [X] T097 [US4] Implement error handling and display error messages
- [X] T098 [P] [US4] Add keyboard shortcut (Escape to cancel)
- [ ] T099 [US4] Test accessibility: focus trap in dialog, Esc to close, keyboard navigation

**Checkpoint**: User Story 4 complete - users can edit tasks ✅

---

## Phase 7: User Story 5 - Delete Tasks (Priority: P5)

**Goal**: Allow users to permanently remove tasks from the board

**Independent Test**: Click delete on task, confirm, and verify task is removed from board

### Tests for User Story 5 (MANDATORY per Constitution) ⚠️

- [ ] T100 [P] [US5] Create E2E test for deleting task with confirmation
- [ ] T101 [P] [US5] Create E2E test for canceling delete action
- [ ] T102 [P] [US5] Create E2E test for empty column after deleting last task
- [ ] T103 [P] [US5] Create integration test for DELETE /api/tasks/:id endpoint
- [ ] T104 [P] [US5] Create unit test for delete confirmation dialog

### Implementation for User Story 5

- [ ] T105 [P] [US5] Create DELETE /api/tasks/:id route in app/api/tasks/[id]/route.ts
- [ ] T106 [P] [US5] Implement task deletion logic with order recalculation
- [ ] T107 [P] [US5] Create DeleteDialog component in components/board/delete-dialog.tsx
- [ ] T108 [US5] Add delete button/icon to TaskCard component
- [ ] T109 [US5] Show DeleteDialog when delete button is clicked
- [ ] T110 [US5] Implement confirm action that calls DELETE /api/tasks/:id
- [ ] T111 [US5] Implement cancel action that closes dialog
- [ ] T112 [US5] Add optimistic UI update to remove task immediately
- [ ] T113 [US5] Implement error handling and rollback on failure
- [ ] T114 [P] [US5] Style DeleteDialog with warning colors and clear messaging
- [ ] T115 [US5] Add keyboard support (Enter to confirm, Esc to cancel)
- [ ] T116 [US5] Test accessibility: focus on confirm button, screen reader announcements

**Checkpoint**: User Story 5 complete - users can delete tasks ✅

---

## Phase 8: Quality Gates & Polish (Per Constitution)

**Purpose**: Constitutional compliance verification and cross-cutting improvements

### Quality Gate Tasks (MANDATORY per Constitution)

- [ ] T117 [P] **Code Quality Gate**: Run `npm run lint` and fix all warnings, verify TypeScript strict mode
- [ ] T118 [P] **Test Coverage Gate**: Run `npm run test:coverage` and verify 80%+ coverage for all user stories
- [ ] T119 [P] **Performance Gate**: Run Lighthouse audit and verify <2s load, <500ms API p95, 60fps animations
- [ ] T120 [P] **Accessibility Gate**: Run axe DevTools and verify WCAG 2.1 AA compliance (no violations)
- [ ] T121 **Code Review Gate**: Create PR, address feedback, ensure all checks pass
- [ ] T122 **Documentation Gate**: Update README.md with setup instructions and feature description

### Polish & Cross-Cutting Concerns

- [ ] T123 [P] Add loading skeletons for better perceived performance
- [ ] T124 [P] Add toast notifications for success/error feedback using shadcn/ui toast
- [ ] T125 [P] Optimize bundle size with dynamic imports for heavy components
- [ ] T126 [P] Add error boundary components for graceful error handling
- [ ] T127 [P] Implement keyboard shortcuts help modal (accessible via "?" key)
- [ ] T128 [P] Add dark mode support using next-themes
- [ ] T129 [P] Optimize Prisma queries with proper indexes and select statements
- [ ] T130 [P] Add comprehensive JSDoc comments to complex functions
- [ ] T131 [P] Create Storybook stories for isolated component development (optional)
- [ ] T132 Validate quickstart.md instructions by following them in fresh environment
- [ ] T133 Create changelog.md documenting all features implemented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - **MVP baseline**
  - User Story 2 (P2): Can start after Foundational - Builds on US1 for drag UI
  - User Story 3 (P3): Can start after Foundational - Independent of US1/US2
  - User Story 4 (P4): Can start after Foundational - Reuses TaskForm from US3
  - User Story 5 (P5): Can start after Foundational - Independent of other stories
- **Quality Gates (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - **MVP foundation**
- **User Story 2 (P2)**: Depends on US1 (needs board and cards to drag)
- **User Story 3 (P3)**: Independent - can run parallel with US2
- **User Story 4 (P4)**: Soft dependency on US3 (reuses TaskForm component)
- **User Story 5 (P5)**: Independent - can run parallel with US3/US4

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD requirement)
- API routes before components that consume them
- Base components (Card, Form) before composed components
- Core functionality before accessibility enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup (Phase 1)**: Tasks T002-T013 can all run in parallel
- **Foundational (Phase 2)**: Tasks T019-T025 can run in parallel after database setup
- **User Story Tests**: All test tasks marked [P] within a story can run in parallel
- **User Story Implementation**: Different components/files marked [P] can be developed simultaneously
- **Different User Stories**: After Foundational, multiple stories can be worked on by different team members:
  - Developer A: US1 (View tasks)
  - Developer B: US3 (Create tasks) - independent of US1
  - After US1 complete: Developer A moves to US2 (Drag/drop)
  - After US3 complete: Developer B moves to US4 (Edit tasks)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
T026: E2E test for loading board
T027: E2E test for empty board
T028: E2E test for scrollable columns
T029: Integration test for GET /api/board
T030: Unit test for Board component

# Launch all implementation tasks together:
T031: Create GET /api/board route
T032: Create Board component
T033: Create Column component
T034: Create TaskCard component
T038: Style Board component
T039: Style Column component
T040: Style TaskCard component
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View and Organize)
4. **STOP and VALIDATE**: Test independently, run quality gates
5. Deploy/demo MVP if ready

**MVP Success Criteria**: Users can view board with tasks organized in columns

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (**MVP!** ✅)
3. Add User Story 2 → Test independently → Deploy/Demo (Drag-and-drop enabled)
4. Add User Stories 3+4 together → Test independently → Deploy/Demo (Full CRUD)
5. Add User Story 5 → Test independently → Deploy/Demo (Complete feature set)
6. Run Quality Gates → Final polish → Production release

### Parallel Team Strategy

With multiple developers:

1. **Sprint 1**: Team completes Setup + Foundational together
2. **Sprint 2**: Once Foundational done
   - Developer A: User Story 1 (P1)
   - Developer B: User Story 3 (P3) - can run parallel
3. **Sprint 3**:
   - Developer A: User Story 2 (P2) - depends on US1
   - Developer B: User Story 4 (P4) - depends on US3
   - Developer C: User Story 5 (P5) - independent
4. **Sprint 4**: Quality Gates & Polish together

---

## Task Summary

**Total Tasks**: 133 tasks
- Phase 1 (Setup): 13 tasks
- Phase 2 (Foundational): 12 tasks
- Phase 3 (US1 - View/Organize): 17 tasks (5 tests + 12 implementation)
- Phase 4 (US2 - Drag/Drop): 20 tasks (6 tests + 14 implementation)
- Phase 5 (US3 - Create): 19 tasks (5 tests + 14 implementation)
- Phase 6 (US4 - Edit): 18 tasks (6 tests + 12 implementation)
- Phase 7 (US5 - Delete): 17 tasks (5 tests + 12 implementation)
- Phase 8 (Quality & Polish): 17 tasks

**Parallel Opportunities**: 68 tasks marked [P] can run in parallel within their phase

**Test Tasks**: 27 test tasks (20% of total) - Constitutional TDD requirement

**MVP Scope**: Phases 1-3 only (42 tasks) for minimal viable product

---

## Notes

- [P] tasks = different files or independent components, no sequential dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable per spec requirements
- TDD workflow: Write failing tests → Get user approval → Implement → Refactor
- Commit after each completed task or logical group of [P] tasks
- Stop at any checkpoint to validate story independence
- Constitutional compliance gates MUST pass before considering feature complete
