import { test, expect } from '@playwright/test';

test.describe('User Story 3: Create New Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the board
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="board"]');
  });

  test('T063: should create a task with title only', async ({ page }) => {
    // Find the "To Do" column
    const todoColumn = page.locator('[aria-label="To Do column"]');
    await expect(todoColumn).toBeVisible();

    // Count existing tasks
    const initialTaskCount = await todoColumn.locator('[data-testid="task-card"]').count();

    // Click "Add Task" button
    const addButton = todoColumn.locator('button:has-text("Add Task")');
    await addButton.click();

    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('text=New Task')).toBeVisible();

    // Fill in title only
    const titleInput = dialog.locator('input[name="title"]');
    await titleInput.fill('New test task');

    // Submit form
    const submitButton = dialog.locator('button:has-text("Create Task")');
    await submitButton.click();

    // Dialog should close
    await expect(dialog).not.toBeVisible();

    // New task should appear in the column
    await expect(todoColumn.locator('[data-testid="task-card"]')).toHaveCount(initialTaskCount + 1);
    await expect(todoColumn.locator('text=New test task')).toBeVisible();
  });

  test('T064: should create a task with title and description', async ({ page }) => {
    const todoColumn = page.locator('[aria-label="To Do column"]');
    
    // Click "Add Task" button
    const addButton = todoColumn.locator('button:has-text("Add Task")');
    await addButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Fill in both fields
    await dialog.locator('input[name="title"]').fill('Task with description');
    await dialog.locator('textarea[name="description"]').fill('This is a detailed description of the task.');

    // Submit form
    await dialog.locator('button:has-text("Create Task")').click();

    // Verify task appears with description
    await expect(todoColumn.locator('text=Task with description')).toBeVisible();
    await expect(todoColumn.locator('text=This is a detailed description')).toBeVisible();
  });

  test('T065: should show validation error when title is empty', async ({ page }) => {
    const todoColumn = page.locator('[aria-label="To Do column"]');
    
    // Click "Add Task" button
    const addButton = todoColumn.locator('button:has-text("Add Task")');
    await addButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Try to submit without filling title
    const submitButton = dialog.locator('button:has-text("Create Task")');
    await submitButton.click();

    // Should show validation error
    const errorMessage = dialog.locator('text=/required|must be at least/i');
    await expect(errorMessage).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();

    // Fill in title and submit should work
    await dialog.locator('input[name="title"]').fill('Valid title');
    await submitButton.click();

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });

  test('should allow creating tasks in different columns', async ({ page }) => {
    // Test creating in "In Progress" column
    const inProgressColumn = page.locator('[aria-label="In Progress column"]');
    
    const addButton = inProgressColumn.locator('button:has-text("Add Task")');
    await addButton.click();

    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input[name="title"]').fill('In progress task');
    await dialog.locator('button:has-text("Create Task")').click();

    // Verify task appears in correct column
    await expect(inProgressColumn.locator('text=In progress task')).toBeVisible();
  });

  test('should support keyboard shortcut to open create form', async ({ page }) => {
    // Focus on the page
    await page.click('body');
    
    // Press Ctrl+N (or Cmd+N on Mac)
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+KeyN`);

    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Title input should be focused
    const titleInput = dialog.locator('input[name="title"]');
    await expect(titleInput).toBeFocused();
  });

  test('should cancel task creation when clicking Cancel', async ({ page }) => {
    const todoColumn = page.locator('[aria-label="To Do column"]');
    const initialTaskCount = await todoColumn.locator('[data-testid="task-card"]').count();
    
    // Open dialog
    await todoColumn.locator('button:has-text("Add Task")').click();
    const dialog = page.locator('[role="dialog"]');

    // Fill in some data
    await dialog.locator('input[name="title"]').fill('This will be cancelled');

    // Click Cancel
    const cancelButton = dialog.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // Dialog should close
    await expect(dialog).not.toBeVisible();

    // No new task should be added
    await expect(todoColumn.locator('[data-testid="task-card"]')).toHaveCount(initialTaskCount);
  });

  test('should clear form after successful submission', async ({ page }) => {
    const todoColumn = page.locator('[aria-label="To Do column"]');
    
    // Create first task
    await todoColumn.locator('button:has-text("Add Task")').click();
    let dialog = page.locator('[role="dialog"]');
    await dialog.locator('input[name="title"]').fill('First task');
    await dialog.locator('button:has-text("Create Task")').click();
    await expect(dialog).not.toBeVisible();

    // Open dialog again
    await todoColumn.locator('button:has-text("Add Task")').click();
    dialog = page.locator('[role="dialog"]');

    // Fields should be empty
    await expect(dialog.locator('input[name="title"]')).toHaveValue('');
    await expect(dialog.locator('textarea[name="description"]')).toHaveValue('');
  });
});
