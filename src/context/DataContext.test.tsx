import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
import { SmallDataRow } from '../types';
import Papa from 'papaparse';

// Mock papaparse
jest.mock('papaparse', () => ({
  parse: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// A simple test component that uses the DataContext
const TestConsumer: React.FC = () => {
  const { data, loading, error, isLargeDataset, toggleDataset, filters, setFilters } = useData();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="dataset-size">{isLargeDataset ? 'Large' : 'Small'}</div>
      <div data-testid="data-length">{data.length}</div>
      <button data-testid="toggle-dataset" onClick={toggleDataset}>Toggle Dataset</button>
      <button 
        data-testid="update-filters" 
        onClick={() => setFilters({ ...filters, testCol: ['testValue'] })}
      >
        Update Filters
      </button>
      <div data-testid="filters">{JSON.stringify(filters)}</div>
    </div>
  );
};

describe('DataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      text: jest.fn().mockResolvedValue('number,mod3,mod4,mod5,mod6\n1,1,1,1,1\n2,2,2,2,2'),
    });
    
    // Mock Papa.parse
    (Papa.parse as jest.Mock).mockImplementation((csvText, options) => {
      const data: SmallDataRow[] = [
        { number: 1, mod3: 1, mod4: 1, mod5: 1, mod6: 1 },
        { number: 2, mod3: 2, mod4: 2, mod5: 2, mod6: 2 },
      ];
      const meta = { fields: ['number', 'mod3', 'mod4', 'mod5', 'mod6'] };
      
      if (options && options.complete) {
        options.complete({ data, meta });
      }
      
      return { data, meta };
    });
  });
  
  test('provides the data context to child components', async () => {
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Verify data is provided
    expect(screen.getByTestId('data-length')).toHaveTextContent('2');
    expect(screen.getByTestId('dataset-size')).toHaveTextContent('Small');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
  });
  
  test('toggles between small and large datasets', async () => {
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Verify it starts with small dataset
    expect(screen.getByTestId('dataset-size')).toHaveTextContent('Small');
    
    // Toggle to large dataset
    act(() => {
      screen.getByTestId('toggle-dataset').click();
    });
    
    // Should be loading again
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Verify dataset is now large
    expect(screen.getByTestId('dataset-size')).toHaveTextContent('Large');
    
    // Check that fetch was called with correct URLs
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/data/dataset_small.csv');
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/data/dataset_large.csv');
  });
  
  test('updates filters correctly', async () => {
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Check initial filters
    expect(screen.getByTestId('filters')).toHaveTextContent('{"number":[],"mod3":[],"mod4":[],"mod5":[],"mod6":[]}');
    
    // Update filters
    act(() => {
      screen.getByTestId('update-filters').click();
    });
    
    // Check updated filters
    expect(screen.getByTestId('filters')).toHaveTextContent('"testCol":["testValue"]');
  });
  
  test('handles fetch error gracefully', async () => {
    // Mock fetch to fail
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
    
    // Check loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    
    // Data should be empty
    expect(screen.getByTestId('data-length')).toHaveTextContent('0');
  });
  
  test('handles Papa.parse error gracefully', async () => {
    // Mock Papa.parse to fail
    (Papa.parse as jest.Mock).mockImplementation((csvText, options) => {
      if (options && options.complete) {
        options.complete({ data: [], meta: { fields: [] }, errors: [{ message: 'Parse error', type: 'Error', code: 'InvalidData' }] });
      }
      return { data: [], meta: { fields: [] }, errors: [{ message: 'Parse error', type: 'Error', code: 'InvalidData' }] };
    });
    
    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );
    
    // Wait for data to load (even though it's empty)
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Data should be empty
    expect(screen.getByTestId('data-length')).toHaveTextContent('0');
  });
  
  test('throws error when useData is used outside of DataProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useData must be used within a DataProvider');
    
    consoleErrorSpy.mockRestore();
  });
}); 