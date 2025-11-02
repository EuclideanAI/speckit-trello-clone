# Research: Kanban Board Implementation

**Feature**: Kanban Board Project Management Tool  
**Date**: 2025-10-26  
**Status**: Complete

## Research Questions

This document consolidates research findings for technical decisions required to implement the Kanban board feature.

---

## 1. Drag-and-Drop Library Selection

**Decision**: Use `@dnd-kit/core` with `@dnd-kit/sortable`

**Rationale**:
- **Modern and maintained**: Actively developed, React 18/19 compatible
- **Accessibility-first**: Built-in keyboard navigation, screen reader support (WCAG 2.1 AA compliant)
- **Performance**: Virtual scrolling support, optimized for 60fps animations
- **Flexible**: Supports multi-column drag-and-drop, reordering within columns
- **TypeScript**: Full TypeScript support with excellent type definitions
- **Size**: ~15KB gzipped (reasonable for performance budget)
- **Touch support**: Built-in touch gesture handling for mobile devices

**Alternatives Considered**:
- **react-beautiful-dnd**: Popular but archived/unmaintained, no longer actively developed, lacks React 19 support
- **react-dnd**: More low-level, requires more boilerplate, larger bundle size (~30KB)
- **Native HTML5 Drag API**: Poor mobile support, accessibility challenges, inconsistent browser behavior

**Implementation Notes**:
- Use `DndContext` at board level
- Use `SortableContext` for each column
- Use `useSortable` hook for task cards
- Implement `onDragEnd` handler for position updates
- Add visual feedback with `DragOverlay` component

---

## 2. Next.js 15 App Router Best Practices

**Decision**: Use App Router with Server Components and API Routes

**Rationale**:
- **Server Components**: Default to Server Components for better performance, use Client Components only when needed (interactivity, hooks)
- **API Routes**: Co-locate backend logic in `app/api/` for full-stack development
- **Data fetching**: Use native `fetch` with caching strategies in Server Components
- **Loading states**: Use `loading.tsx` and Suspense boundaries for better UX
- **Error handling**: Use `error.tsx` for graceful error boundaries

**Key Patterns**:
1. **Server Components** (default):
   - Board layout, column structure
   - Initial data fetching
   - Static content

2. **Client Components** (`'use client'`):
   - Task cards (drag-and-drop interaction)
   - Forms (state management)
   - Interactive modals/dialogs

3. **API Routes**:
   - RESTful endpoints in `app/api/tasks/`
   - Use `NextRequest` and `NextResponse`
   - Implement proper HTTP methods (GET, POST, PATCH, DELETE)
   - Return JSON with appropriate status codes

**Performance Optimizations**:
- Use `next/dynamic` for code splitting large components
- Implement `loading.tsx` for route-level suspense
- Use `revalidatePath` or `revalidateTag` for on-demand ISR
- Optimize images with `next/image`

---

## 3. Prisma Schema Design for Kanban Board

**Decision**: Three-model schema (Board, Column, Task) with position tracking

**Rationale**:
- **Normalized structure**: Separate entities for flexibility and future extensibility
- **Position tracking**: Integer `order` field for deterministic ordering
- **Cascading deletes**: Preserve referential integrity
- **SQLite compatibility**: Use appropriate field types for SQLite

**Schema Structure**:
```prisma
model Board {
  id        String   @id @default(cuid())
  name      String
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

**Key Design Decisions**:
- **CUID IDs**: Collision-resistant, URL-safe identifiers
- **Order field**: Integer for simple, predictable ordering (vs. floating point)
- **Unique constraints**: Prevent duplicate positions within same parent
- **Indexes**: Optimize queries for column-based task retrieval
- **Timestamps**: Track creation and modification times
- **Cascading deletes**: Auto-cleanup when parent entities are deleted

**Reordering Strategy**:
- When task moves: Update `columnId` and `order` in single transaction
- When task reordered in same column: Update `order` of affected tasks
- Use transaction to ensure atomicity
- Recalculate order values as needed (e.g., 0, 1, 2, 3...)

---

## 4. shadcn/ui Component Selection

**Decision**: Use core shadcn/ui components with Tailwind customization

**Components Needed**:
1. **Card**: Task card container
2. **Button**: Add task, action buttons
3. **Dialog**: Task edit modal, delete confirmation
4. **Input**: Task title input
5. **Textarea**: Task description input
6. **Form**: Form wrapper with validation (using react-hook-form + zod)
7. **Label**: Accessible form labels
8. **ScrollArea**: Scrollable column content

**Rationale**:
- **Copy-paste architecture**: Components live in your codebase, fully customizable
- **Radix UI primitives**: Accessible by default (WCAG 2.1 AA compliant)
- **Tailwind styling**: Consistent with project styling approach
- **TypeScript**: Full type safety
- **Composition**: Build complex UIs from simple primitives

**Installation Command**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button dialog input textarea form label scroll-area
```

**Customization**:
- Use Tailwind utility classes for responsive design
- Extend theme in `tailwind.config.ts` for brand colors
- Use CSS variables for light/dark mode support
- Add custom variants in component files as needed

---

## 5. State Management Strategy

**Decision**: React Context + Server Actions for state management

**Rationale**:
- **Simplicity**: No external state library needed for MVP scope
- **Server Actions**: Native Next.js 15 feature for mutations
- **Optimistic updates**: Use React's `useOptimistic` hook for immediate UI feedback
- **Context**: Share board state across components without prop drilling

**Implementation Pattern**:
1. **Server Actions** (`app/actions.ts`):
   - Create, update, delete, reorder tasks
   - Use `revalidatePath` to refresh data
   - Return new state or error

2. **Client Context** (`components/providers/board-provider.tsx`):
   - Wrap board page with provider
   - Expose task operations via context
   - Implement optimistic updates for smooth UX

3. **Custom Hooks** (`lib/hooks/`):
   - `useTasks`: Access task data and operations
   - `useBoard`: Access board-level state
   - Encapsulate context consumption

**Benefits**:
- No client-side state synchronization complexity
- Server-side validation and business logic
- Type-safe mutations with TypeScript
- Progressive enhancement (works without JS)

---

## 6. Testing Strategy

**Decision**: Three-layer testing approach with Vitest, RTL, and Playwright

**Layer 1 - Unit Tests (Vitest)**:
- **Target**: Pure functions, utilities, hooks
- **Location**: `__tests__/unit/`
- **Coverage**: Validation functions, utility helpers, custom hooks
- **Example**: `lib/validations.ts`, `lib/utils.ts`

**Layer 2 - Integration Tests (React Testing Library)**:
- **Target**: Component integration, API routes
- **Location**: `__tests__/integration/`
- **Coverage**: Component interactions, form submissions, API endpoint logic
- **Example**: Task form submission, drag-and-drop behavior (mocked)

**Layer 3 - E2E Tests (Playwright)**:
- **Target**: Full user journeys
- **Location**: `__tests__/e2e/`
- **Coverage**: Complete user stories from spec.md
- **Example**: Create task → drag to new column → edit → delete

**Test-Driven Development (TDD) Workflow**:
1. Write failing test for acceptance criteria
2. Implement minimum code to pass test
3. Refactor while keeping tests green
4. Repeat for each requirement

**Coverage Target**: 80%+ for new code (constitutional requirement)

---

## 7. Accessibility Implementation

**Decision**: WCAG 2.1 Level AA compliance with keyboard and screen reader support

**Key Requirements**:
1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Enter/Space to activate buttons
   - Arrow keys for task navigation within columns
   - Keyboard shortcut for moving tasks between columns

2. **Screen Reader Support**:
   - Semantic HTML (`<main>`, `<article>`, `<button>`)
   - ARIA labels for drag-and-drop state
   - Live regions for dynamic updates
   - Descriptive alt text for icons

3. **Visual Design**:
   - 4.5:1 contrast ratio for text (WCAG AA)
   - 3:1 contrast for UI components
   - Clear focus indicators (2px outline)
   - 44x44px minimum touch targets

4. **Drag-and-Drop Alternative**:
   - Context menu (right-click or keyboard)
   - Modal dialog to select destination column
   - Keyboard shortcuts (e.g., Ctrl+Arrow to move)

**Testing Tools**:
- axe DevTools browser extension
- Lighthouse accessibility audit
- NVDA/JAWS screen reader testing
- Keyboard-only navigation testing

---

## 8. Performance Optimization

**Decision**: Implement Next.js optimizations and monitoring

**Strategies**:
1. **Code Splitting**:
   - Use `next/dynamic` for heavy components (forms, dialogs)
   - Lazy load non-critical features
   - Keep main bundle under 200KB gzipped

2. **Image Optimization**:
   - Use `next/image` for automatic optimization
   - WebP format with fallbacks
   - Lazy loading for images below fold

3. **Database Optimization**:
   - Index foreign keys (`columnId` in Task)
   - Batch updates in transactions
   - Limit query result sizes

4. **Caching Strategy**:
   - Server Component caching for static data
   - `revalidatePath` for targeted cache invalidation
   - Browser caching for static assets

5. **Monitoring**:
   - Next.js Analytics for Core Web Vitals
   - Lighthouse CI in pipeline
   - Bundle size monitoring with `@next/bundle-analyzer`

**Performance Budget**:
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3s
- Cumulative Layout Shift (CLS): <0.1
- First Input Delay (FID): <100ms

---

## 9. Development Workflow

**Decision**: Structured workflow with quality gates

**Steps**:
1. **Setup** (one-time):
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

2. **Development**:
   ```bash
   npm run dev        # Start Next.js dev server
   npm run db:studio  # Open Prisma Studio (DB GUI)
   ```

3. **Testing** (TDD workflow):
   ```bash
   npm run test:unit        # Run unit tests (watch mode)
   npm run test:integration # Run integration tests
   npm run test:e2e         # Run E2E tests
   npm run test:coverage    # Generate coverage report
   ```

4. **Quality Checks**:
   ```bash
   npm run lint       # ESLint
   npm run typecheck  # TypeScript
   npm run format     # Prettier
   ```

5. **Build**:
   ```bash
   npm run build      # Production build
   npm run start      # Start production server
   ```

**Git Workflow**:
- Feature branches from `main`
- Run tests before commit
- All checks must pass before merge
- Squash commits on merge

---

## Summary

All research decisions align with constitutional requirements:
- ✅ **Code Quality**: TypeScript, ESLint, Prettier, component-based architecture
- ✅ **Testing**: Three-layer test strategy with TDD workflow, 80%+ coverage target
- ✅ **UX Consistency**: shadcn/ui design system, WCAG 2.1 AA compliance, responsive design
- ✅ **Performance**: <2s load, 60fps animations, <200KB bundle, optimized database queries

Technology stack is locked in and ready for implementation planning phase.
