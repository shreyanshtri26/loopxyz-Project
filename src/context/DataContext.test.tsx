import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';

// Mock fetch API
const mockFetchData = (data: string) => {
  return jest.fn(() =>
    Promise.resolve({
      text: () => Promise.resolve(data)
    })
  );
};

// Set up initial mock
global.fetch = mockFetchData('number,mod3,mod4,mod5,mod6\n1,1,1,1,1') as jest.Mock;

// Test component to access context
const TestConsumer = () => {
  const { data, loading, isLargeDataset, toggleDataset, error } = useData();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="data-length">{data.length}</div>
      <div data-testid="is-large">{isLargeDataset.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button data-testid="toggle" onClick={toggleDataset}>Toggle</button>
    </div>
  );
};

describe('DataContext', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    // Reset to default mock
    global.fetch = mockFetchData('number,mod3,mod4,mod5,mod6\n1,1,1,1,1') as jest.Mock;
  });

  it('provides loading state initially', () => {
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('loads data and sets loading to false', async () => {
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('data-length').textContent).toBe('1');
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/data/dataset_small.csv');
  });

  it('toggles between datasets', async () => {
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Toggle dataset
    act(() => {
      screen.getByTestId('toggle').click();
    });
    
    // Check that isLargeDataset is now true
    expect(screen.getByTestId('is-large').textContent).toBe('true');
    
    // Check that fetch was called with large dataset
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/data/dataset_large.csv');
    });
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useData must be used within a DataProvider');
    
    // Restore console.error
    console.error = originalError;
  });

  it('handles fetch errors correctly', async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;
    
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).not.toBe('no-error');
    });
    
    // Data should be empty when fetch fails
    expect(screen.getByTestId('data-length').textContent).toBe('0');
  });

  it('clears error when toggling dataset', async () => {
    // First, setup fetch to fail
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;
    
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).not.toBe('no-error');
    });
    
    // Now, setup fetch to succeed
    global.fetch = mockFetchData('number,mod350,mod8000,mod20002\n1,1,1,1') as jest.Mock;
    
    // Toggle dataset
    act(() => {
      screen.getByTestId('toggle').click();
    });
    
    // Error should be cleared and data should be loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).toBe('no-error');
      expect(screen.getByTestId('data-length').textContent).toBe('1');
    });
  });

  it('handles malformed CSV data', async () => {
    // Mock fetch with malformed CSV
    global.fetch = mockFetchData('malformed,csv\ndata,without,proper,columns') as jest.Mock;
    
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Should handle malformed data gracefully
    expect(screen.getByTestId('data-length').textContent).not.toBe('0');
  });

  it('loads large dataset with correct columns', async () => {
    // Setup mock for large dataset
    global.fetch = mockFetchData('number,mod350,mod8000,mod20002\n1,1,1,1\n2,2,2,2') as jest.Mock;
    
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Toggle to large dataset
    act(() => {
      screen.getByTestId('toggle').click();
    });
    
    // Verify large dataset loaded correctly
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('data-length').textContent).toBe('2');
      expect(screen.getByTestId('is-large').textContent).toBe('true');
    });
  });
}); 