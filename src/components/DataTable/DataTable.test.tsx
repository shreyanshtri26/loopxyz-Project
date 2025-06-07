import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';
import { DataRow } from '../../types';

// Mock react-window to avoid rendering issues in tests
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount }: { children: any; itemCount: number }) => {
    const items = Array.from({ length: Math.min(itemCount, 20) }).map((_, index) => 
      children({ index, style: {} })
    );
    return <div data-testid="virtual-list">{items}</div>;
  }
}));

describe('DataTable', () => {
  const mockData: DataRow[] = [
    { number: 1, mod3: 1, mod4: 1, mod5: 1, mod6: 1 },
    { number: 2, mod3: 2, mod4: 2, mod5: 2, mod6: 2 },
    { number: 3, mod3: 0, mod4: 3, mod5: 3, mod6: 3 },
    { number: 4, mod3: 1, mod4: 0, mod5: 4, mod6: 4 },
    { number: 5, mod3: 2, mod4: 1, mod5: 0, mod6: 5 },
  ];

  it('renders table headers correctly', () => {
    render(<DataTable data={mockData} />);
    
    // Check for header cells
    expect(screen.getByText('number')).toBeInTheDocument();
    expect(screen.getByText('mod3')).toBeInTheDocument();
    expect(screen.getByText('mod4')).toBeInTheDocument();
    expect(screen.getByText('mod5')).toBeInTheDocument();
    expect(screen.getByText('mod6')).toBeInTheDocument();
  });

  it('renders pagination information correctly', () => {
    render(<DataTable data={mockData} pageSize={1} />);
    
    // Check pagination info
    expect(screen.getByText(/Page 1 of 5/)).toBeInTheDocument();
    expect(screen.getByText(/5 total rows/)).toBeInTheDocument();
    
    // Check pagination buttons
    const prevButton = screen.getByText('Previous');
    const nextButton = screen.getByText('Next');
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('renders no data message when data is empty', () => {
    render(<DataTable data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('paginates correctly to next page', () => {
    render(<DataTable data={mockData} pageSize={2} />);
    
    // Initial state
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Should now be on page 2
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
  });

  it('paginates correctly to previous page', () => {
    render(<DataTable data={mockData} pageSize={2} />);
    
    // Go to page 2
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
    
    // Click previous button
    fireEvent.click(screen.getByText('Previous'));
    
    // Should now be back on page 1
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<DataTable data={mockData} pageSize={2} />);
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<DataTable data={mockData} pageSize={2} />);
    
    // Go to the last page
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    
    // Next button should be disabled on the last page
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('renders correct number of rows per page', () => {
    const pageSize = 2;
    render(<DataTable data={mockData} pageSize={pageSize} />);
    
    // The react-window mock renders each row with the actual data
    const rows = screen.getAllByRole('row');
    
    // +1 for the header row
    expect(rows.length).toBe(pageSize + 1);
  });

  it('handles large datasets efficiently', () => {
    // Create a large dataset
    const largeData: DataRow[] = Array.from({ length: 1000 }, (_, i) => ({
      number: i,
      mod3: i % 3,
      mod4: i % 4,
      mod5: i % 5,
      mod6: i % 6
    }));
    
    render(<DataTable data={largeData} pageSize={100} />);
    
    // Should show correct pagination info
    expect(screen.getByText(/Page 1 of 10/)).toBeInTheDocument();
    expect(screen.getByText(/1000 total rows/)).toBeInTheDocument();
    
    // Virtual list should be rendered (limited to 20 items in our mock)
    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList).toBeInTheDocument();
  });

  it('displays correct data for the current page', () => {
    render(<DataTable data={mockData} pageSize={2} />);
    
    // First page should show items 1 and 2
    expect(screen.getByText('1')).toBeInTheDocument(); // First item's number
    expect(screen.getByText('2')).toBeInTheDocument(); // Second item's number
    
    // Third item should not be visible yet
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    
    // Go to second page
    fireEvent.click(screen.getByText('Next'));
    
    // Second page should show items 3 and 4
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // First item should no longer be visible
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('handles non-default columns', () => {
    // Create data with different columns
    const customData = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 }
    ];
    
    // @ts-ignore - Ignore TypeScript error for test purposes
    render(<DataTable data={customData} />);
    
    // Should render headers for the custom columns
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
  });

  it('handles custom page sizes', () => {
    // Use a custom page size
    const pageSize = 3;
    render(<DataTable data={mockData} pageSize={pageSize} />);
    
    // Should show correct pagination info
    expect(screen.getByText(`Page 1 of ${Math.ceil(mockData.length / pageSize)}`)).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    render(<DataTable data={mockData} loading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}); 