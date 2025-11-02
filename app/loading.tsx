/**
 * Loading State
 * 
 * Displayed while board data is being fetched
 * Uses Suspense boundary in Next.js App Router
 */
export default function Loading() {
  return (
    <main className="h-screen px-6 py-8">
      <div className="mb-6">
        <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="min-w-[280px] w-80 bg-gray-100 dark:bg-gray-900 rounded-lg p-4"
          >
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-20 bg-white dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
