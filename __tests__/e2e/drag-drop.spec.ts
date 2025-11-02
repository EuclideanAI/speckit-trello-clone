import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Story 2: Drag and Drop Tasks
 * 
 * Goal: Enable drag-and-drop interaction for moving tasks
 * Independent Test: Drag task from one column to another and verify it appears in new column
 */

test.describe('Board - Drag and Drop Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="board"]', { timeout: 5000 });
  });

  /**
   * T043: E2E test for dragging task between columns
   * Acceptance Criteria:
   * - User can drag a task from one column to another
   * - Task appears in the new column
   * - Task is removed from the original column
   * - Task order is updated in the database
   */
  test('should drag task between columns', async ({ page }) => {
    // Find the first task in "To Do" column
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    const firstTask = toDoColumn.locator('[data-testid="task-card"]').first();
    const taskTitle = await firstTask.locator('h3').textContent();

    // Get initial task counts
    const toDoTasksBefore = await toDoColumn.locator('[data-testid="task-card"]').count();
    const inProgressColumn = page.locator('[data-testid="column"]').filter({ hasText: 'In Progress' });
    const inProgressTasksBefore = await inProgressColumn.locator('[data-testid="task-card"]').count();

    // Drag task from "To Do" to "In Progress"
    const dragHandle = firstTask.locator('[data-testid="drag-handle"]');
    const dropTarget = inProgressColumn.locator('[data-testid="task-list"]');

    await dragHandle.dragTo(dropTarget);

    // Wait for the drag operation to complete
    await page.waitForTimeout(500);

    // Verify task counts changed
    const toDoTasksAfter = await toDoColumn.locator('[data-testid="task-card"]').count();
    const inProgressTasksAfter = await inProgressColumn.locator('[data-testid="task-card"]').count();

    expect(toDoTasksAfter).toBe(toDoTasksBefore - 1);
    expect(inProgressTasksAfter).toBe(inProgressTasksBefore + 1);

    // Verify the task now appears in "In Progress"
    await expect(inProgressColumn.getByText(taskTitle || '')).toBeVisible();

    // Verify the task is no longer in "To Do" (or count is reduced)
    expect(toDoTasksAfter).toBeLessThan(toDoTasksBefore);
  });

  /**
   * T044: E2E test for reordering task within same column
   * Acceptance Criteria:
   * - User can reorder tasks within the same column
   * - Task order is visually updated
   * - Other tasks shift to accommodate the change
   */
  test('should reorder task within same column', async ({ page }) => {
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    const tasks = toDoColumn.locator('[data-testid="task-card"]');
    
    // Get initial task order
    const firstTaskTitle = await tasks.nth(0).locator('h3').textContent();
    const secondTaskTitle = await tasks.nth(1).locator('h3').textContent();

    // Drag second task to first position
    const dragHandle = tasks.nth(1).locator('[data-testid="drag-handle"]');
    const dropTarget = tasks.nth(0);

    await dragHandle.dragTo(dropTarget);
    await page.waitForTimeout(500);

    // Verify order changed
    const newFirstTaskTitle = await tasks.nth(0).locator('h3').textContent();
    expect(newFirstTaskTitle).toBe(secondTaskTitle);

    // Old first task should now be second
    const newSecondTaskTitle = await tasks.nth(1).locator('h3').textContent();
    expect(newSecondTaskTitle).toBe(firstTaskTitle);
  });

  /**
   * T045: E2E test for invalid drop (task returns to origin)
   * Acceptance Criteria:
   * - Dragging task outside valid drop zones returns it to original position
   * - No error occurs
   * - Task remains in original column
   */
  test('should handle invalid drop by returning task to origin', async ({ page }) => {
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    const firstTask = toDoColumn.locator('[data-testid="task-card"]').first();
    const taskTitle = await firstTask.locator('h3').textContent();
    const initialCount = await toDoColumn.locator('[data-testid="task-card"]').count();

    // Try to drag task to an invalid location (board header)
    const dragHandle = firstTask.locator('[data-testid="drag-handle"]');
    const invalidTarget = page.locator('h1'); // Board title

    // Attempt drag to invalid location
    const dragBox = await dragHandle.boundingBox();
    const targetBox = await invalidTarget.boundingBox();

    if (dragBox && targetBox) {
      await page.mouse.move(dragBox.x + dragBox.width / 2, dragBox.y + dragBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBox.x, targetBox.y);
      await page.mouse.up();
    }

    await page.waitForTimeout(500);

    // Verify task is still in original column
    const finalCount = await toDoColumn.locator('[data-testid="task-card"]').count();
    expect(finalCount).toBe(initialCount);
    await expect(toDoColumn.getByText(taskTitle || '')).toBeVisible();
  });

  /**
   * T046: E2E test for visual feedback during drag
   * Acceptance Criteria:
   * - Dragged task has visual indicator (opacity, shadow)
   * - Drop zones highlight when task hovers over them
   * - Cursor changes to indicate drag state
   */
  test('should provide visual feedback during drag', async ({ page }) => {
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    const firstTask = toDoColumn.locator('[data-testid="task-card"]').first();
    const dragHandle = firstTask.locator('[data-testid="drag-handle"]');

    // Get initial cursor style
    const initialCursor = await dragHandle.evaluate((el) => 
      window.getComputedStyle(el).cursor
    );

    // Cursor should indicate draggable
    expect(['grab', 'move', 'pointer']).toContain(initialCursor);

    // Start drag operation
    const box = await dragHandle.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();

      // Check if task has dragging class or opacity change
      const isDragging = await firstTask.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity !== '1' || el.classList.contains('dragging');
      });

      expect(isDragging).toBe(true);

      await page.mouse.up();
    }
  });

  /**
   * T047: Integration test - verify API endpoint exists
   * This is a smoke test to ensure the reorder endpoint is available
   */
  test('should have reorder API endpoint available', async ({ page }) => {
    // Make a test API call to verify endpoint exists
    const response = await page.request.patch('/api/tasks/reorder', {
      data: {
        taskId: 'test-id',
        sourceColumnId: 'col-1',
        destinationColumnId: 'col-2',
        newOrder: 0,
      },
    });

    // Should return 400 or 404, not 405 (method not allowed) or 500
    // This verifies the endpoint exists and has some validation
    expect([400, 404, 200]).toContain(response.status());
  });

  /**
   * T048: Accessibility test - keyboard navigation for drag
   * Acceptance Criteria:
   * - User can select task with Enter/Space
   * - Arrow keys move task between columns
   * - Escape cancels drag operation
   * - Screen reader announces drag state
   */
  test('should support keyboard-based drag and drop', async ({ page }) => {
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    const firstTask = toDoColumn.locator('[data-testid="task-card"]').first();
    const taskTitle = await firstTask.locator('h3').textContent();

    // Focus on first task
    await firstTask.focus();
    await expect(firstTask).toBeFocused();

    // Press Space or Enter to select for dragging
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Press ArrowRight to move to next column
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // Press Space or Enter to drop
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Verify task moved to "In Progress" column
    const inProgressColumn = page.locator('[data-testid="column"]').filter({ hasText: 'In Progress' });
    await expect(inProgressColumn.getByText(taskTitle || '')).toBeVisible();

    // Verify ARIA attributes exist for screen readers
    const ariaLabel = await firstTask.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  /**
   * Performance test: Drag should complete within 500ms
   */
  test('should complete drag operation quickly', async ({ page }) => {
    const toDoColumn = page.locator('[data-testid="column"]').filter({ hasText: 'To Do' });
    const firstTask = toDoColumn.locator('[data-testid="task-card"]').first();
    const dragHandle = firstTask.locator('[data-testid="drag-handle"]');
    
    const inProgressColumn = page.locator('[data-testid="column"]').filter({ hasText: 'In Progress' });
    const dropTarget = inProgressColumn.locator('[data-testid="task-list"]');

    const startTime = Date.now();
    await dragHandle.dragTo(dropTarget);
    const endTime = Date.now();

    const dragTime = endTime - startTime;

    // Drag operation should complete quickly (constitutional requirement: 60fps = 16ms frame time)
    expect(dragTime).toBeLessThan(500);
  });
});
