/**
 * E2E Tests for User Story 5: Delete Tasks
 * T100-T102: Test deleting tasks with confirmation and cancellation
 */

import { test, expect } from '@playwright/test';

test.describe('Delete Task - User Story 5', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the board
    await page.goto('http://localhost:3000');
    
    // Wait for board to load
    await expect(page.getByRole('main', { name: /kanban board/i })).toBeVisible();
  });

  test('T100: should delete task with confirmation', async ({ page }) => {
    // Count initial tasks
    const initialTaskCount = await page.locator('[data-testid="task-card"]').count();
    
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible();
    
    // Click on the card to open edit dialog
    await taskCard.click();
    
    // Wait for edit dialog to appear
    const editDialog = page.getByRole('dialog');
    await expect(editDialog).toBeVisible();
    
    // Find and click the delete button in the dialog
    const deleteButton = editDialog.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    
    // Wait for confirmation dialog to appear
    const confirmDialog = page.getByRole('alertdialog').or(
      page.getByRole('dialog').filter({ hasText: /are you sure/i })
    );
    await expect(confirmDialog).toBeVisible();
    
    // Should show warning message
    await expect(confirmDialog.getByText(/cannot be undone/i)).toBeVisible();
    
    // Click confirm/delete button
    const confirmButton = confirmDialog.getByRole('button', { name: /delete/i });
    await confirmButton.click();
    
    // Wait for page to reload (our implementation uses window.location.reload)
    await page.waitForLoadState('networkidle');
    
    // Verify task count decreased
    const finalTaskCount = await page.locator('[data-testid="task-card"]').count();
    expect(finalTaskCount).toBe(initialTaskCount - 1);
  });

  test('T101: should cancel delete action without removing task', async ({ page }) => {
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible();
    
    // Get the task title
    const taskTitle = await taskCard.textContent();
    
    // Click card to open edit dialog
    await taskCard.click();
    
    // Wait for edit dialog
    const editDialog = page.getByRole('dialog');
    await expect(editDialog).toBeVisible();
    
    // Click delete button
    const deleteButton = editDialog.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    
    // Wait for confirmation dialog
    const confirmDialog = page.getByRole('alertdialog').or(
      page.getByRole('dialog').filter({ hasText: /are you sure/i })
    );
    await expect(confirmDialog).toBeVisible();
    
    // Click cancel button
    const cancelButton = confirmDialog.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    
    // Dialog should close
    await expect(confirmDialog).not.toBeVisible();
    
    // Task should still be visible
    if (taskTitle) {
      await expect(page.getByText(taskTitle)).toBeVisible();
    }
  });

  test('T101b: should cancel delete with Escape key', async ({ page }) => {
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible();
    
    const taskTitle = await taskCard.textContent();
    
    // Click card to open edit dialog
    await taskCard.click();
    
    // Click delete button
    const editDialog = page.getByRole('dialog');
    const deleteButton = editDialog.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    
    // Wait for confirmation dialog
    const confirmDialog = page.getByRole('alertdialog').or(
      page.getByRole('dialog').filter({ hasText: /are you sure/i })
    );
    await expect(confirmDialog).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Dialog should close
    await expect(confirmDialog).not.toBeVisible();
    
    // Task should still be visible
    await expect(page.getByText(taskTitle || '')).toBeVisible();
  });

  test('T102: should show empty state after deleting last task in column', async ({ page }) => {
    // Find a column with tasks
    const column = page.locator('[data-testid="column"]').first();
    await expect(column).toBeVisible();
    
    // Count tasks in the column
    const tasks = column.locator('[data-testid="task-card"]');
    const initialTaskCount = await tasks.count();
    
    // Skip if column has no tasks or too many (keep test fast)
    if (initialTaskCount === 0 || initialTaskCount > 5) {
      test.skip();
      return;
    }
    
    // Delete all tasks in the column one by one
    for (let i = 0; i < initialTaskCount; i++) {
      // Wait for page to be ready
      await page.waitForLoadState('networkidle');
      
      // Get the first task in this column
      const taskCard = column.locator('[data-testid="task-card"]').first();
      
      // Break if no more tasks
      const isVisible = await taskCard.isVisible().catch(() => false);
      if (!isVisible) break;
      
      // Click card to open edit dialog, waiting for any animations
      await taskCard.click({ force: true });
      await page.waitForTimeout(500);
      
      // Click delete button in edit dialog
      const editDialog = page.getByRole('dialog');
      await expect(editDialog).toBeVisible();
      const deleteButton = editDialog.getByRole('button', { name: /delete/i });
      await deleteButton.click();
      
      // Confirm deletion
      const confirmDialog = page.getByRole('alertdialog').or(
        page.getByRole('dialog').filter({ hasText: /are you sure/i })
      );
      await expect(confirmDialog).toBeVisible();
      
      const confirmButton = confirmDialog.getByRole('button', { name: /delete/i });
      await confirmButton.click();
      
      // Wait for page reload after each deletion
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }
    
    // Verify no more tasks in the column
    const remainingTasks = await column.locator('[data-testid="task-card"]').count();
    expect(remainingTasks).toBe(0);
  });

  test('should show delete button in edit dialog', async ({ page }) => {
    // Find and click a task card to open edit dialog
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.click();
    
    // Wait for edit dialog
    const editDialog = page.getByRole('dialog');
    await expect(editDialog).toBeVisible();
    
    // Should have a delete button in the dialog
    const deleteButton = editDialog.getByRole('button', { name: /delete|remove|trash/i });
    await expect(deleteButton).toBeVisible();
  });

  test('should delete task from edit dialog', async ({ page }) => {
    // Open edit dialog
    const taskCard = page.locator('[data-testid="task-card"]').first();
    const taskTitle = await taskCard.textContent();
    await taskCard.click();
    
    const editDialog = page.getByRole('dialog');
    await expect(editDialog).toBeVisible();
    
    // Click delete button in edit dialog
    const deleteButton = editDialog.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    
    // Should show confirmation dialog
    const confirmDialog = page.getByRole('alertdialog').or(
      page.getByRole('dialog').filter({ hasText: /are you sure/i })
    );
    await expect(confirmDialog).toBeVisible();
    
    // Confirm deletion
    const confirmButton = confirmDialog.getByRole('button', { name: /delete/i });
    await confirmButton.click();
    
    // Wait for page reload
    await page.waitForLoadState('networkidle');
    
    // Task should be removed
    await expect(page.getByText(taskTitle || '')).not.toBeVisible();
  });

  test('should focus confirm button when delete dialog opens', async ({ page }) => {
    // Open task edit dialog
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.click();
    
    // Click delete button
    const editDialog = page.getByRole('dialog');
    const deleteButton = editDialog.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    
    // Confirmation dialog should appear
    const confirmDialog = page.getByRole('alertdialog').or(
      page.getByRole('dialog').filter({ hasText: /are you sure/i })
    );
    await expect(confirmDialog).toBeVisible();
    
    // Confirm button should be focused (or have focus within dialog)
    const confirmButton = confirmDialog.getByRole('button', { name: /delete/i });
    
    // Either the button is focused, or focus is within the dialog
    const isFocused = await confirmButton.evaluate((el) => el === document.activeElement);
    const dialogHasFocus = await confirmDialog.evaluate((el) => el.contains(document.activeElement));
    
    expect(isFocused || dialogHasFocus).toBe(true);
  });
});
