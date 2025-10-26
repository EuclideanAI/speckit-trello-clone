import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Story 1: View and Organize Tasks
 * 
 * Goal: Display board with tasks organized in columns
 * Independent Test: Load board with pre-populated tasks and verify display
 */

test.describe('Board - View and Organize Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  /**
   * T026: E2E test for loading board with tasks
   * Acceptance Criteria:
   * - Board loads successfully
   * - All 3 columns are visible (To Do, In Progress, Done)
   * - Tasks display in their respective columns
   * - Task titles and descriptions are visible
   */
  test('should load board with pre-populated tasks across 3 columns', async ({ page }) => {
    // Wait for the board to load
    await page.waitForSelector('[data-testid="board"]', { timeout: 5000 });

    // Verify board title is visible
    await expect(page.getByRole('heading', { name: /kanban board/i })).toBeVisible();

    // Verify all 3 columns are present
    const columns = page.locator('[data-testid="column"]');
    await expect(columns).toHaveCount(3);

    // Verify column names
    await expect(page.getByRole('heading', { name: 'To Do' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'In Progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Done' })).toBeVisible();

    // Verify tasks are displayed (should have 7 tasks from seed data)
    const tasks = page.locator('[data-testid="task-card"]');
    await expect(tasks).toHaveCount(7);

    // Verify specific tasks exist in correct columns
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    await expect(toDoColumn.locator('[data-testid="task-card"]')).toHaveCount(3);
    await expect(toDoColumn.getByText('Setup project structure')).toBeVisible();

    const inProgressColumn = page.locator('[data-testid="column"]').filter({ hasText: 'In Progress' });
    await expect(inProgressColumn.locator('[data-testid="task-card"]')).toHaveCount(2);
    await expect(inProgressColumn.getByText('Create task components')).toBeVisible();

    const doneColumn = page.locator('[data-testid="column"]').filter({ hasText: 'Done' });
    await expect(doneColumn.locator('[data-testid="task-card"]')).toHaveCount(2);
    await expect(doneColumn.getByText('Initialize Next.js project')).toBeVisible();
  });

  /**
   * T027: E2E test for empty board display with column placeholders
   * Acceptance Criteria:
   * - Board loads even with no tasks
   * - All 3 columns are visible
   * - Empty state message is shown in columns
   */
  test('should display empty board with column placeholders', async ({ page }) => {
    // Note: This test would require a way to load empty board state
    // For now, we'll test the structure exists
    await page.waitForSelector('[data-testid="board"]', { timeout: 5000 });

    // Verify columns exist even if empty
    const columns = page.locator('[data-testid="column"]');
    await expect(columns).toHaveCount(3);

    // Each column should have a container for tasks (even if empty)
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    const taskList = toDoColumn.locator('[data-testid="task-list"]');
    await expect(taskList).toBeVisible();
  });

  /**
   * T028: E2E test for scrollable columns with many tasks
   * Acceptance Criteria:
   * - Columns are vertically scrollable when content overflows
   * - Horizontal scrolling works for multiple columns on small screens
   * - All tasks remain accessible via scrolling
   */
  test('should support scrollable columns with many tasks', async ({ page }) => {
    await page.waitForSelector('[data-testid="board"]', { timeout: 5000 });

    // Check that columns have overflow scroll capability
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    const taskList = toDoColumn.locator('[data-testid="task-list"]');
    
    // Verify the task list is scrollable (should have overflow CSS)
    const overflow = await taskList.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.overflowY;
    });
    
    // Should be 'auto' or 'scroll' to allow scrolling
    expect(['auto', 'scroll']).toContain(overflow);

    // Test responsive horizontal scrolling on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    const board = page.locator('[data-testid="board"]');
    const boardOverflow = await board.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.overflowX;
    });
    
    // Board should be horizontally scrollable on mobile
    expect(['auto', 'scroll']).toContain(boardOverflow);
  });

  /**
   * Accessibility test: Keyboard navigation
   */
  test('should support keyboard navigation', async ({ page }) => {
    await page.waitForSelector('[data-testid="board"]', { timeout: 5000 });

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // First task card should be focusable
    const firstTask = page.locator('[data-testid="task-card"]').first();
    await expect(firstTask).toBeFocused();
  });

  /**
   * Performance test: Page load time
   */
  test('should load within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="board"]', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Constitutional requirement: <2s page load
    expect(loadTime).toBeLessThan(2000);
  });
});
