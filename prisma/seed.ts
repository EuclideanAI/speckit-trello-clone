import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create board
  const board = await prisma.board.create({
    data: {
      name: 'My Kanban Board',
    },
  });
  console.log('✅ Board created:', board.name);

  // Create columns
  const toDo = await prisma.column.create({
    data: {
      boardId: board.id,
      name: 'To Do',
      order: 0,
    },
  });
  console.log('✅ Column created:', toDo.name);

  const inProgress = await prisma.column.create({
    data: {
      boardId: board.id,
      name: 'In Progress',
      order: 1,
    },
  });
  console.log('✅ Column created:', inProgress.name);

  const done = await prisma.column.create({
    data: {
      boardId: board.id,
      name: 'Done',
      order: 2,
    },
  });
  console.log('✅ Column created:', done.name);

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      { columnId: toDo.id, title: 'Setup project structure', order: 0 },
      { columnId: toDo.id, title: 'Design database schema', order: 1 },
      { columnId: toDo.id, title: 'Implement drag and drop', order: 2 },
      {
        columnId: inProgress.id,
        title: 'Create task components',
        description: 'Build TaskCard, TaskForm components',
        order: 0,
      },
      { columnId: inProgress.id, title: 'Setup Prisma and database', order: 1 },
      {
        columnId: done.id,
        title: 'Initialize Next.js project',
        description: 'Setup Next.js 15 with TypeScript',
        order: 0,
      },
      { columnId: done.id, title: 'Install dependencies', order: 1 },
    ],
  });
  console.log('✅ Created 7 sample tasks');

  console.log('🎉 Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
