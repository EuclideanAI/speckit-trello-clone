import { Board } from '@/components/board/board';
import { prisma } from '@/lib/db';

/**
 * Home Page
 * 
 * Fetches and displays the Kanban board with Server Components
 * Uses Next.js 15 App Router data fetching
 */
export default async function Home() {
  // Fetch board data with Server Component
  const board = await prisma.board.findFirst({
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  // Handle case where no board exists
  if (!board) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Board Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please run the database seed script to create a board.
          </p>
        </div>
      </main>
    );
  }

  return <Board board={board} />;
}
