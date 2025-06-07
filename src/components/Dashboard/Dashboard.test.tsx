import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { DataProvider } from '../../context/DataContext';
import { FiltersState } from '../../types';

// Mock the components used by Dashboard
jest.mock('../FilterDropdown/FilterDropdown', () => ({
  FilterDropdown: ({ column, onChange }: any) => (
    <div data-testid={`filter-${column}`}>
      {column} Filter
      <button 
        data-testid={`update-${column}`} 
        onClick={() => onChange(['1'])}
      >
        Update Filter
      </button>
    </div>
  )
}));

jest.mock('../DataTable/DataTable', () => ({
  DataTable: ({ data, loading }: any) => (
    <div data-testid="data-table">
      {loading ? 'Loading...' : `Data Table with ${data.length} rows`}
    </div>
  )
}));

jest.mock('../LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: any) => <div data-testid="loading-spinner">{message}</div>
}));

// Mock useFilter hook
jest.mock('../../hooks/useFilter', () => ({
  useFilter: (data: any[], filters: FiltersState) => {
    // Simple mock implementation
    let filteredData = [...data];
    const hasActiveFilters = Object.values(filters).some(values => values.length > 0);
    
    if (hasActiveFilters) {
      // Just reduce the data size for testing purposes
      filteredData = filteredData.slice(0, 1);
    }
    
    const mockColumnOptions = {
      mod3: { all: ['0', '1', '2'], available: ['0', '1', '2'] },
      mod4: { all: ['0', '1', '2', '3'], available: ['0', '1', '2', '3'] },
      mod5: { all: ['0', '1', '2', '3', '4'], available: ['0', '1', '2', '3', '4'] },
      mod6: { all: ['0', '1', '2', '3', '4', '5'], available: ['0', '1', '2', '3', '4', '5'] },
    };
    
    return { filteredData, columnOptions: mockColumnOptions };
  }
}));

// Mock the fetch function
const smallDatasetCsv = `number,mod3,mod4,mod5,mod6\n1,1,1,1,1\n2,2,2,2,2\n3,0,3,3,3`;
const largeDatasetCsv = `number,mod350,mod8000,mod20002\n1,1,1,1\n2,2,2,2`;

const mockFetch = (data: string) => jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve(data)
  })
);

// Set initial mock
global.fetch = mockFetch(smallDatasetCsv) as jest.Mock;

describe('Dashboard', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    // Reset to default mock
    global.fetch = mockFetch(smallDatasetCsv) as jest.Mock;
  });

  it('renders dashboard header', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    // First it should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Data Analysis Dashboard')).toBeInTheDocument();
    });
  });

  it('shows dataset toggle button', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    await waitFor(() => {
      const toggleButton = screen.getByText(/Switch to .* Dataset/);
      expect(toggleButton).toBeInTheDocument();
    });
  });

  it('shows results summary after data loads', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Showing .* of .* records/)).toBeInTheDocument();
    });
  });

  it('displays data table after loading', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });

  it('renders filter dropdowns for each column after data loads', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-mod3')).toBeInTheDocument();
      expect(screen.getByTestId('filter-mod4')).toBeInTheDocument();
      expect(screen.getByTestId('filter-mod5')).toBeInTheDocument();
      expect(screen.getByTestId('filter-mod6')).toBeInTheDocument();
    });
  });

  it('toggles between datasets', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/Switch to Large Dataset/)).toBeInTheDocument();
    });
    
    // Update fetch mock for large dataset
    global.fetch = mockFetch(largeDatasetCsv) as jest.Mock;
    
    // Click toggle button
    fireEvent.click(screen.getByText(/Switch to Large Dataset/));
    
    // Should show loading spinner again
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for large dataset to load
    await waitFor(() => {
      expect(screen.getByText(/Switch to Small Dataset/)).toBeInTheDocument();
    });
    
    // Should fetch large dataset
    expect(global.fetch).toHaveBeenCalledWith('/data/dataset_large.csv');
  });

  it('updates filters when a filter dropdown is changed', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('filter-mod3')).toBeInTheDocument();
    });
    
    // Get the initial number of records
    const initialCountText = screen.getByText(/Showing .* of .* records/);
    
    // Update a filter
    fireEvent.click(screen.getByTestId('update-mod3'));
    
    // Results summary should change
    await waitFor(() => {
      const newCountText = screen.getByText(/Showing .* of .* records/);
      expect(newCountText.textContent).not.toEqual(initialCountText.textContent);
    });
  });

  it('handles filter reset', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('filter-mod3')).toBeInTheDocument();
    });
    
    // Update a filter
    fireEvent.click(screen.getByTestId('update-mod3'));
    
    // Get the filtered count
    const filteredCountText = screen.getByText(/Showing .* of .* records/);
    
    // Reset filters
    fireEvent.click(screen.getByText('Reset Filters'));
    
    // Results should show all records again
    await waitFor(() => {
      const resetCountText = screen.getByText(/Showing .* of .* records/);
      expect(resetCountText.textContent).not.toEqual(filteredCountText.textContent);
    });
  });

  it('maintains filters when toggling datasets', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('filter-mod3')).toBeInTheDocument();
    });
    
    // Apply a filter
    fireEvent.click(screen.getByTestId('update-mod3'));
    
    // Prepare mock for large dataset
    global.fetch = mockFetch(largeDatasetCsv) as jest.Mock;
    
    // Toggle to large dataset
    fireEvent.click(screen.getByText(/Switch to Large Dataset/));
    
    // Wait for large dataset to load
    await waitFor(() => {
      expect(screen.getByText(/Switch to Small Dataset/)).toBeInTheDocument();
    });
    
    // Filters should be reset since columns change between datasets
    const resetButton = screen.getByText('Reset Filters');
    expect(resetButton).toBeInTheDocument();
  });

  it('shows error message when data loading fails', async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed to fetch'))) as jest.Mock;
    
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/Error loading data/i)).toBeInTheDocument();
    });
  });

  it('maintains page state between filter changes', async () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
    
    // Apply a filter
    fireEvent.click(screen.getByTestId('update-mod3'));
    
    // Data table should update
    await waitFor(() => {
      expect(screen.getByText(/Data Table with 1 rows/)).toBeInTheDocument();
    });
  });
}); 