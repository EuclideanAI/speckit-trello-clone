# Quickstart Guide: Kanban Board

**Feature**: Kanban Board Project Management Tool  
**Date**: 2025-10-26  
**Tech Stack**: Next.js 15, Prisma, SQLite, shadcn/ui, Tailwind CSS

---

## Prerequisites

- **Node.js**: v18.17 or higher
- **npm**: v9 or higher (or pnpm/yarn)
- **Git**: For version control
- **Code Editor**: VS Code recommended

---

## Initial Setup

### 1. Install Dependencies

```bash
# Install all project dependencies
npm install

# Expected key packages:
# - next@15.x
# - react@19.x
# - prisma@5.x
# - @prisma/client@5.x
# - tailwindcss@3.x
# - @dnd-kit/core@6.x
# - @dnd-kit/sortable@8.x
# - lucide-react@latest
```

### 2. Configure Environment

Create `.env.local` file in project root:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup shadcn/ui

Initialize shadcn/ui (if not already done):

```bash
npx shadcn-ui@latest init

# Select options:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - TypeScript: Yes
```

Install required components:

```bash
npx shadcn-ui@latest add card button dialog input textarea form label scroll-area
```

### 4. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

Verify database setup:

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio

# Should show:
# - 1 Board
# - 3 Columns (To Do, In Progress, Done)
# - 7 Sample tasks distributed across columns
```

---

## Development Workflow

### Running the Development Server

```bash
# Start Next.js development server
npm run dev

# Server runs at: http://localhost:3000
# API endpoints available at: http://localhost:3000/api/*
```

**Expected output:**
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### Development Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run db:studio        # Open Prisma Studio (database GUI)

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests (Vitest)
npm run test:integration # Run integration tests (RTL)
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:coverage    # Generate coverage report
npm run test:watch       # Run tests in watch mode

# Quality Checks
npm run lint             # Run ESLint
npm run lint:fix         # Fix auto-fixable lint issues
npm run typecheck        # Run TypeScript compiler check
npm run format           # Run Prettier formatter
npm run format:check     # Check formatting without changes

# Database
npm run db:migrate       # Create new migration
npm run db:reset         # Reset database (delete + migrate + seed)
npm run db:push          # Push schema changes without migration
npm run db:seed          # Run seed script

# Build
npm run build            # Create production build
npm run start            # Start production server
npm run analyze          # Analyze bundle size
```

---

## Project Structure Navigation

### Key Directories

```
trello-clone/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (backend)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main board page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── board/            # Feature components
├── lib/                   # Utilities & services
│   ├── db.ts             # Prisma client
│   ├── validations.ts    # Zod schemas
│   └── hooks/            # Custom React hooks
├── prisma/                # Database
│   ├── schema.prisma     # Schema definition
│   ├── migrations/       # Migration history
│   └── seed.ts          # Seed data
└── __tests__/             # Test files
    ├── unit/             # Unit tests
    ├── integration/      # Integration tests
    └── e2e/              # End-to-end tests
```

### Important Files

- **`app/page.tsx`**: Main board page (entry point)
- **`prisma/schema.prisma`**: Database schema
- **`lib/db.ts`**: Prisma client singleton
- **`lib/validations.ts`**: Zod validation schemas
- **`tailwind.config.ts`**: Tailwind configuration
- **`next.config.js`**: Next.js configuration

---

## Test-Driven Development (TDD) Workflow

### Constitutional Requirement

**TDD is MANDATORY** per Constitution Principle II. Tests must be written BEFORE implementation.

### TDD Cycle

1. **Red**: Write a failing test
2. **Green**: Write minimum code to pass test
3. **Refactor**: Improve code quality while keeping tests green

### Example TDD Workflow

**Scenario**: Implement task creation

**Step 1 - Write failing test** (`__tests__/integration/api/tasks.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';

describe('POST /api/tasks', () => {
  it('creates a new task with title and description', async () => {
    const response = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: 'test-column-id',
        title: 'New Task',
        description: 'Task description'
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.title).toBe('New Task');
    expect(data.description).toBe('Task description');
  });
});
```

**Step 2 - Run test (should fail)**:

```bash
npm run test:integration
# ❌ Test fails - API route doesn't exist yet
```

**Step 3 - Implement minimum code** (`app/api/tasks/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { taskSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = taskSchema.parse(body);
  
  const task = await prisma.task.create({
    data: {
      columnId: validated.columnId,
      title: validated.title,
      description: validated.description,
      order: 0 // Simplified for example
    }
  });
  
  return NextResponse.json(task, { status: 201 });
}
```

**Step 4 - Run test again (should pass)**:

```bash
npm run test:integration
# ✅ Test passes
```

**Step 5 - Refactor if needed**, keeping tests green.

### Running Tests During Development

```bash
# Watch mode - tests auto-run on file changes
npm run test:watch

# TDD workflow:
# 1. Write test → save → see it fail (red)
# 2. Write code → save → see it pass (green)
# 3. Refactor → save → ensure still passes (green)
```

---

## Database Development

### Common Database Tasks

**View current schema:**
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

**Make schema changes:**
1. Edit `prisma/schema.prisma`
2. Create migration: `npm run db:migrate`
3. Name migration descriptively (e.g., "add-task-priority")
4. Verify changes in Prisma Studio

**Reset database:**
```bash
npm run db:reset
# Drops DB → Runs migrations → Seeds data
```

**Inspect generated SQL:**
```bash
# Migrations stored in: prisma/migrations/
# Each migration has:
#   - migration.sql (SQL commands)
#   - README.md (description)
```

---

## API Development

### Creating New Endpoints

**Pattern**: Next.js App Router API routes

**Example**: GET /api/tasks

1. Create file: `app/api/tasks/route.ts`
2. Export HTTP method functions:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const tasks = await prisma.task.findMany({
    orderBy: { order: 'asc' }
  });
  
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle task creation
}
```

3. Test with curl or Postman:

```bash
# GET request
curl http://localhost:3000/api/tasks

# POST request
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"columnId":"xyz","title":"New Task"}'
```

### API Error Handling

**Pattern**: Consistent error responses

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', issues: error.errors },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Component Development

### Creating New Components

**Pattern**: Colocate by feature in `components/board/`

**Example**: TaskCard component

1. Create file: `components/board/task-card.tsx`
2. Use TypeScript for props:

```typescript
'use client';

import { Task } from '@prisma/client';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold">{task.title}</h3>
      {task.description && <p className="text-sm">{task.description}</p>}
    </div>
  );
}
```

3. Import shadcn/ui components as needed:

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
```

### Client vs Server Components

**Server Components** (default):
- No `'use client'` directive
- Can fetch data directly
- Cannot use hooks or event handlers

**Client Components** (`'use client'`):
- Needs `'use client'` at top
- Can use hooks (useState, useEffect, etc.)
- Can handle events (onClick, onDrag, etc.)

---

## Debugging

### Common Issues

**Issue**: Prisma client outdated
```bash
# Solution: Regenerate client
npx prisma generate
```

**Issue**: Port 3000 already in use
```bash
# Solution: Kill existing process or use different port
lsof -ti:3000 | xargs kill
# or
npm run dev -- -p 3001
```

**Issue**: Database locked
```bash
# Solution: Close Prisma Studio and reset
npx prisma studio # Close this
npm run db:reset
```

**Issue**: TypeScript errors
```bash
# Solution: Check and fix type errors
npm run typecheck
```

### Debugging Tools

**Next.js DevTools**: Built into browser
**React DevTools**: Browser extension
**Prisma Studio**: `npx prisma studio`
**Network Tab**: Inspect API requests/responses
**Console Logs**: `console.log()` in Server/Client Components

---

## Performance Monitoring

### Development Metrics

```bash
# Lighthouse audit
npm run build
npm run start
# Open Chrome DevTools → Lighthouse → Run audit
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Opens visualization showing:
# - Bundle sizes
# - Component dependencies
# - Optimization opportunities
```

### Performance Targets

From spec.md Success Criteria:
- **Page Load**: <2s on 3G
- **TTI**: <3s
- **Drag Response**: 16ms (60fps)
- **API Response**: <500ms (p95)
- **Bundle Size**: <200KB gzipped

---

## Accessibility Testing

### Manual Testing

**Keyboard Navigation**:
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys in task lists
- Esc to close modals

**Screen Reader**:
- Install NVDA (Windows) or enable VoiceOver (Mac)
- Navigate with screen reader on
- Verify all elements are announced correctly

### Automated Testing

```bash
# Install axe DevTools browser extension
# Open app in browser
# Run axe scan
# Fix reported issues
```

### Accessibility Checklist

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text or aria-labels
- [ ] Interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] ARIA attributes used correctly
- [ ] Semantic HTML elements used

---

## Git Workflow

### Branch Strategy

```bash
# Feature branch (already created)
git branch  # Shows: 001-kanban-board

# Make changes
git add .
git commit -m "feat: implement task creation"

# Push to remote (if configured)
git push origin 001-kanban-board
```

### Commit Message Format

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- test: Add/update tests
- refactor: Code refactoring
- docs: Documentation
- style: Code formatting
- perf: Performance improvement
```

---

## Deployment (Future)

**Note**: Deployment is out of scope for MVP, but here's the path:

1. **Update Database**: Switch from SQLite to PostgreSQL
2. **Environment Variables**: Set production env vars
3. **Deploy**: Use Vercel, Netlify, or similar
4. **Migrations**: Run `npx prisma migrate deploy`

---

## Troubleshooting

### Can't find module '@/...'

**Cause**: TypeScript path alias not configured  
**Solution**: Check `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Prisma Client not found

**Cause**: Client not generated  
**Solution**: `npx prisma generate`

### Hot reload not working

**Cause**: File watcher limit reached  
**Solution** (Linux):

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Drag and drop not working on mobile

**Cause**: Touch events not configured  
**Solution**: Ensure `@dnd-kit` touch sensors enabled in DndContext

---

## Next Steps

After completing setup:

1. ✅ Verify app runs: `npm run dev` → http://localhost:3000
2. ✅ Verify tests run: `npm run test`
3. ✅ Review spec: `specs/001-kanban-board/spec.md`
4. ✅ Review data model: `specs/001-kanban-board/data-model.md`
5. ✅ Start TDD cycle: Pick user story, write tests, implement

---

## Resources

- **Next.js 15 Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com
- **@dnd-kit**: https://docs.dndkit.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vitest**: https://vitest.dev
- **Playwright**: https://playwright.dev

---

## Support

- Review constitution: `.specify/memory/constitution.md`
- Check spec: `specs/001-kanban-board/spec.md`
- API reference: `specs/001-kanban-board/contracts/api.yaml`
- Research notes: `specs/001-kanban-board/research.md`

**Ready to code!** 🚀
