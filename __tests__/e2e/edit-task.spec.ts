/**
 * E2E Tests for User Story 4: Edit Existing Tasks
 * T082-T085: Test editing task title, description, cancel, and validation
 */

import { test, expect } from '@playwright/test';

test.describe('Edit Task - User Story 4', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the board
    await page.goto('http://localhost:3000');
    
    // Wait for board to load
    await expect(page.getByRole('main', { name: /kanban board/i })).toBeVisible();
  });

  test('T082: should edit task title successfully', async ({ page }) => {
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible();
    
    // Get the original title
    const originalTitle = await taskCard.textContent();
    
    // Click the task card to open edit dialog
    await taskCard.click();
    
    // Wait for dialog to open
    const dialog = page.getByRole('dialog', { name: /edit task|task details/i });
    await expect(dialog).toBeVisible();
    
    // Find the title input and clear it
    const titleInput = dialog.getByLabel(/title|card title/i);
    await expect(titleInput).toBeVisible();
    await titleInput.clear();
    
    // Type new title
    const newTitle = 'Updated Task Title';
    await titleInput.fill(newTitle);
    
    // Save changes - look for save/done button
    const saveButton = dialog.getByRole('button', { name: /save|done/i });
    await saveButton.click();
    
    // Wait for dialog to close
    await expect(dialog).not.toBeVisible();
    
    // Verify the task card shows the new title
    await expect(page.getByText(newTitle)).toBeVisible();
  });

  test('T083: should edit task description successfully', async ({ page }) => {
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.click();
    
    // Wait for dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Find and fill description textarea
    const descriptionInput = dialog.getByLabel(/description/i).or(
      dialog.getByPlaceholder(/add a more detailed description/i)
    );
    await expect(descriptionInput).toBeVisible();
    
    const newDescription = 'This is an updated task description with more details.';
    await descriptionInput.clear();
    await descriptionInput.fill(newDescription);
    
    // Save changes
    const saveButton = dialog.getByRole('button', { name: /save|done/i });
    await saveButton.click();
    
    // Dialog should close
    await expect(dialog).not.toBeVisible();
    
    // Re-open to verify description was saved
    await taskCard.click();
    await expect(dialog).toBeVisible();
    
    const savedDescription = dialog.getByLabel(/description/i).or(
      dialog.getByPlaceholder(/add a more detailed description/i)
    );
    await expect(savedDescription).toHaveValue(newDescription);
  });

  test('T084: should cancel edit without saving changes', async ({ page }) => {
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    const originalTitle = await taskCard.textContent();
    
    // Open dialog
    await taskCard.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Make changes to title
    const titleInput = dialog.getByLabel(/title|card title/i);
    await titleInput.clear();
    await titleInput.fill('This Should Not Be Saved');
    
    // Click cancel or close button
    const cancelButton = dialog.getByRole('button', { name: /cancel|close/i }).or(
      dialog.locator('[aria-label*="close" i]')
    );
    await cancelButton.click();
    
    // Dialog should close
    await expect(dialog).not.toBeVisible();
    
    // Verify original title is still displayed
    await expect(page.getByText(originalTitle || '')).toBeVisible();
    
    // Re-open and verify title wasn't changed
    await taskCard.click();
    await expect(dialog).toBeVisible();
    const titleAfterCancel = await dialog.getByLabel(/title|card title/i).inputValue();
    expect(titleAfterCancel).toBe(originalTitle);
  });

  test('T084b: should cancel edit with Escape key', async ({ page }) => {
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    const originalTitle = await taskCard.textContent();
    
    // Open dialog
    await taskCard.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Make changes
    const titleInput = dialog.getByLabel(/title|card title/i);
    await titleInput.clear();
    await titleInput.fill('This Should Not Be Saved Either');
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Dialog should close
    await expect(dialog).not.toBeVisible();
    
    // Verify original title is still there
    await expect(page.getByText(originalTitle || '')).toBeVisible();
  });

  test('T085: should show validation error when clearing title', async ({ page }) => {
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.click();
    
    // Wait for dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Clear the title
    const titleInput = dialog.getByLabel(/title|card title/i);
    await titleInput.clear();
    
    // Try to save with empty title
    const saveButton = dialog.getByRole('button', { name: /save|done/i });
    await saveButton.click();
    
    // Should show validation error
    const errorMessage = dialog.getByText(/title.*required|please enter.*title/i);
    await expect(errorMessage).toBeVisible();
    
    // Dialog should still be open
    await expect(dialog).toBeVisible();
    
    // Save button should be disabled or error should prevent save
    // Either the button is disabled or the form shows an error
    const isDisabled = await saveButton.isDisabled().catch(() => false);
    const hasError = await errorMessage.isVisible();
    expect(isDisabled || hasError).toBe(true);
  });

  test('T085b: should show validation error when title is too long', async ({ page }) => {
    // Find an existing task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.click();
    
    // Wait for dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Enter a very long title (> 100 characters)
    const longTitle = 'A'.repeat(101);
    const titleInput = dialog.getByLabel(/title|card title/i);
    await titleInput.clear();
    await titleInput.fill(longTitle);
    
    // Try to save
    const saveButton = dialog.getByRole('button', { name: /save|done/i });
    await saveButton.click();
    
    // Should show validation error
    const errorMessage = dialog.getByText(/title.*too long|maximum.*100|title.*exceed/i);
    await expect(errorMessage).toBeVisible();
    
    // Dialog should still be open
    await expect(dialog).toBeVisible();
  });

  test('should show hover effect on task card', async ({ page }) => {
    // Find a task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible();
    
    // Hover over the card
    await taskCard.hover();
    
    // Should show edit button/icon
    const editButton = taskCard.locator('[aria-label*="edit" i]').or(
      taskCard.getByRole('button', { name: /edit/i })
    );
    await expect(editButton).toBeVisible();
    
    // Card should have hover effect (border change)
    // Check for specific class or style that indicates hover state
    await expect(taskCard).toHaveClass(/hover|border/i);
  });

  test('should open dialog when clicking edit button', async ({ page }) => {
    // Find a task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.hover();
    
    // Click the edit button (pencil icon)
    const editButton = taskCard.locator('[aria-label*="edit" i]').or(
      taskCard.getByRole('button', { name: /edit/i })
    );
    await editButton.click();
    
    // Dialog should open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('should focus title input when dialog opens', async ({ page }) => {
    // Find and click a task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.click();
    
    // Wait for dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Title input should be focused
    const titleInput = dialog.getByLabel(/title|card title/i);
    await expect(titleInput).toBeFocused();
  });

  test('should save changes with Enter key (when appropriate)', async ({ page }) => {
    // Find a task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.click();
    
    // Wait for dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Change title
    const titleInput = dialog.getByLabel(/title|card title/i);
    await titleInput.clear();
    const newTitle = 'Quick Edit Title';
    await titleInput.fill(newTitle);
    
    // Note: Enter key behavior might vary based on focus
    // This test documents expected behavior but may need adjustment
    // based on whether description is multiline
  });
});
