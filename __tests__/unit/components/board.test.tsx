import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Board } from '@/components/board/board';

/**
 * Unit Test: Board Component
 * 
 * Tests the Board component rendering with columns and tasks
 */

describe('Board Component', () => {
  const mockBoardData = {
    id: 'board-1',
    name: 'My Kanban Board',
    createdAt: new Date(),
    updatedAt: new Date(),
    columns: [
      {
        id: 'col-1',
        boardId: 'board-1',
        name: 'To Do',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [
          {
            id: 'task-1',
            columnId: 'col-1',
            title: 'Setup project structure',
            description: null,
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'task-2',
            columnId: 'col-1',
            title: 'Design database schema',
            description: null,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      {
        id: 'col-2',
        boardId: 'board-1',
        name: 'In Progress',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [],
      },
      {
        id: 'col-3',
        boardId: 'board-1',
        name: 'Done',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [
          {
            id: 'task-3',
            columnId: 'col-3',
            title: 'Initialize Next.js project',
            description: 'Setup Next.js 15 with TypeScript',
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ],
  };

  /**
   * T030: Unit test for Board component rendering
   * Should render board with all columns and tasks
   */
  it('should render board with columns and tasks', () => {
    render(<Board board={mockBoardData} />);

    // Verify board is rendered
    expect(screen.getByTestId('board')).toBeInTheDocument();

    // Verify all columns are rendered
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();

    // Verify tasks are rendered
    expect(screen.getByText('Setup project structure')).toBeInTheDocument();
    expect(screen.getByText('Design database schema')).toBeInTheDocument();
    expect(screen.getByText('Initialize Next.js project')).toBeInTheDocument();
  });

  it('should render empty columns without tasks', () => {
    render(<Board board={mockBoardData} />);

    // In Progress column should be empty
    const inProgressColumn = screen.getByRole('heading', { name: 'In Progress' }).closest('[data-testid="column"]');
    expect(inProgressColumn).toBeInTheDocument();
    
    // Should still have the column structure
    const columns = screen.getAllByTestId('column');
    expect(columns).toHaveLength(3);
  });

  it('should display task descriptions when available', () => {
    render(<Board board={mockBoardData} />);

    // Task with description should show it
    expect(screen.getByText('Setup Next.js 15 with TypeScript')).toBeInTheDocument();
  });

  it('should render columns in correct order', () => {
    render(<Board board={mockBoardData} />);

    const columns = screen.getAllByTestId('column');
    
    // First column should be "To Do"
    expect(columns[0]).toHaveTextContent('To Do');
    
    // Second column should be "In Progress"
    expect(columns[1]).toHaveTextContent('In Progress');
    
    // Third column should be "Done"
    expect(columns[2]).toHaveTextContent('Done');
  });

  it('should have proper accessibility attributes', () => {
    render(<Board board={mockBoardData} />);

    // Board should have proper role
    const board = screen.getByTestId('board');
    expect(board).toHaveAttribute('role', 'main');

    // Each task card should be focusable
    const taskCards = screen.getAllByTestId('task-card');
    taskCards.forEach((card) => {
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  it('should handle empty board gracefully', () => {
    const emptyBoard = {
      ...mockBoardData,
      columns: mockBoardData.columns.map((col) => ({
        ...col,
        tasks: [],
      })),
    };

    render(<Board board={emptyBoard} />);

    // Columns should still render
    expect(screen.getAllByTestId('column')).toHaveLength(3);
    
    // No tasks should be present
    expect(screen.queryAllByTestId('task-card')).toHaveLength(0);
  });
});
