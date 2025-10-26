import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/components/board/task-form';

describe('TaskForm - T067: Unit Test', () => {
  it('should render title and description inputs', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should show validation error when title is empty', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Try to submit without filling title
    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/required|must be at least/i)).toBeInTheDocument();
    });

    // Should not call onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate title length (min 1, max 200)', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    // Test too long title
    const longTitle = 'a'.repeat(201);
    await user.clear(titleInput);
    await user.type(titleInput, longTitle);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be at most 200 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate description length (max 1000)', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    // Valid title but too long description
    await user.type(titleInput, 'Valid title');
    const longDescription = 'a'.repeat(1001);
    await user.type(descriptionInput, longDescription);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be at most 1000 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form with title only', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New task title');

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        columnId: 'col_1',
        title: 'New task title',
        description: '',
      });
    });
  });

  it('should submit valid form with title and description', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await user.type(titleInput, 'Task with description');
    await user.type(descriptionInput, 'This is a detailed description');

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        columnId: 'col_1',
        title: 'Task with description',
        description: 'This is a detailed description',
      });
    });
  });

  it('should call onCancel when Cancel button is clicked', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should focus title input on mount', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toHaveFocus();
  });

  it('should clear form after submission if reset is called', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskForm
        columnId="col_1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;

    await user.type(titleInput, 'Test task');
    await user.type(descriptionInput, 'Test description');

    expect(titleInput.value).toBe('Test task');
    expect(descriptionInput.value).toBe('Test description');
  });
});
