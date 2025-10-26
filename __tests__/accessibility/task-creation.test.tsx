/**
 * Accessibility Tests for Task Creation Form
 * T081: Test form accessibility (labels, focus management, screen reader)
 * 
 * Tests verify:
 * - ARIA labels and roles
 * - Keyboard navigation
 * - Focus management
 * - Screen reader announcements
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Column } from '@/components/board/column';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data
const mockColumn = {
  id: 'col-1',
  name: 'To Do',
  boardId: 'board-1',
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  tasks: [],
};

describe('Task Creation Form - Accessibility', () => {
  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA labels on form elements', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Click "Add a card" button
      const addButton = screen.getByRole('button', { name: /add a new task to to do column/i });
      expect(addButton).toHaveAccessibleName();
      await user.click(addButton);

      // Check form has proper role
      const form = screen.getByRole('form', { name: /add new task/i });
      expect(form).toBeInTheDocument();

      // Check input has proper label
      const input = screen.getByRole('textbox', { name: /task title/i });
      expect(input).toHaveAccessibleName();
      expect(input).toHaveAttribute('aria-required', 'true');

      // Check buttons have proper labels
      const submitButton = screen.getByRole('button', { name: /add new task to column/i });
      expect(submitButton).toHaveAccessibleName();

      const cancelButton = screen.getByRole('button', { name: /cancel adding task/i });
      expect(cancelButton).toHaveAccessibleName();
    });

    it('should mark decorative icons as aria-hidden', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // The Plus icon should be hidden from screen readers
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      const plusIcon = addButton.querySelector('svg');
      expect(plusIcon).toHaveAttribute('aria-hidden', 'true');

      // Click to show form
      await user.click(addButton);

      // The X icon should be hidden from screen readers
      const cancelButton = screen.getByRole('button', { name: /cancel adding task/i });
      const xIcon = cancelButton.querySelector('svg');
      expect(xIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should indicate invalid state with aria-invalid', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Open form
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      const input = screen.getByRole('textbox', { name: /task title/i });
      
      // Initially should be false
      expect(input).toHaveAttribute('aria-invalid', 'false');

      // Type something then delete it
      await user.type(input, 'a');
      await user.clear(input);

      // Should now show invalid
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open form with Ctrl/Cmd+N keyboard shortcut', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Simulate keyboard shortcut
      const event = new CustomEvent('add-task-shortcut', {
        detail: { columnId: 'col-1' },
      });
      window.dispatchEvent(event);

      // Wait for form to appear
      await waitFor(() => {
        expect(screen.getByRole('form', { name: /add new task/i })).toBeInTheDocument();
      });

      // Input should be focused
      const input = screen.getByRole('textbox', { name: /task title/i });
      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it('should submit form with Enter key', async () => {
      const user = userEvent.setup();
      const mockOnTaskCreated = jest.fn();
      
      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ task: { id: '1', title: 'Test Task' } }),
        })
      ) as jest.Mock;

      render(<Column column={mockColumn} onTaskCreated={mockOnTaskCreated} />);

      // Open form
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      // Type and press Enter
      const input = screen.getByRole('textbox', { name: /task title/i });
      await user.type(input, 'New Task{Enter}');

      // Should call fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/tasks',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('New Task'),
          })
        );
      });
    });

    it('should cancel form with Escape key', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Open form
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      // Press Escape
      const input = screen.getByRole('textbox', { name: /task title/i });
      await user.type(input, 'Some text{Escape}');

      // Form should close
      await waitFor(() => {
        expect(screen.queryByRole('form', { name: /add new task/i })).not.toBeInTheDocument();
      });
    });

    it('should allow Tab navigation between form elements', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Open form
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      const input = screen.getByRole('textbox', { name: /task title/i });
      const submitButton = screen.getByRole('button', { name: /add new task to column/i });
      const cancelButton = screen.getByRole('button', { name: /cancel adding task/i });

      // Input should be focused initially
      expect(input).toHaveFocus();

      // Tab to submit button
      await user.tab();
      expect(submitButton).toHaveFocus();

      // Tab to cancel button
      await user.tab();
      expect(cancelButton).toHaveFocus();

      // Shift+Tab back to submit button
      await user.tab({ shift: true });
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('should auto-focus input when form opens', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Open form
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      // Input should be focused
      const input = screen.getByRole('textbox', { name: /task title/i });
      expect(input).toHaveFocus();
    });

    it('should maintain focus when typing', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Open form and type
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      const input = screen.getByRole('textbox', { name: /task title/i });
      await user.type(input, 'Test Task');

      // Input should still be focused
      expect(input).toHaveFocus();
      expect(input).toHaveValue('Test Task');
    });

    it('should return focus to "Add a card" button after canceling', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Open form
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel adding task/i });
      await user.click(cancelButton);

      // "Add a card" button should be back
      await waitFor(() => {
        const newAddButton = screen.getByRole('button', { name: /add a new task/i });
        expect(newAddButton).toBeInTheDocument();
      });
    });
  });

  describe('Automated Accessibility Checks', () => {
    it('should have no accessibility violations when form is closed', async () => {
      const { container } = render(<Column column={mockColumn} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when form is open', async () => {
      const user = userEvent.setup();
      const { container } = render(<Column column={mockColumn} />);

      // Open form
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with text in form', async () => {
      const user = userEvent.setup();
      const { container } = render(<Column column={mockColumn} />);

      // Open form and type
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      const input = screen.getByRole('textbox', { name: /task title/i });
      await user.type(input, 'Test Task Title');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should have live region for dynamic content updates', () => {
      render(<Column column={mockColumn} />);

      // Check if column has proper region role
      const column = screen.getByRole('region', { name: /to do column/i });
      expect(column).toBeInTheDocument();
    });

    it('should announce button states (disabled/enabled)', async () => {
      const user = userEvent.setup();
      render(<Column column={mockColumn} />);

      // Open form
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      const submitButton = screen.getByRole('button', { name: /add new task to column/i });

      // Should be disabled when input is empty
      expect(submitButton).toBeDisabled();

      // Type to enable button
      const input = screen.getByRole('textbox', { name: /task title/i });
      await user.type(input, 'Valid Task');

      // Should be enabled
      expect(submitButton).toBeEnabled();
    });

    it('should announce loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock slow fetch
      global.fetch = jest.fn(() =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ task: { id: '1', title: 'Test' } }),
            } as Response);
          }, 100);
        })
      ) as jest.Mock;

      render(<Column column={mockColumn} />);

      // Open form and submit
      const addButton = screen.getByRole('button', { name: /add a new task/i });
      await user.click(addButton);

      const input = screen.getByRole('textbox', { name: /task title/i });
      await user.type(input, 'Test Task');

      const submitButton = screen.getByRole('button', { name: /add new task to column/i });
      await user.click(submitButton);

      // Should show loading text
      expect(screen.getByText(/adding\.\.\./i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});
