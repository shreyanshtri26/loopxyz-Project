import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
import { DataRow } from '../types';

// Mock the fetchCSV function
jest.mock('../utils/csvParser', () => ({
  fetchCSV: jest.fn().mockResolvedValue([
    { number: '1', mod3: '1', mod4: '1', mod5: '1', mod6: '1' },
    { number: '2', mod3: '2', mod4: '2', mod5: '2', mod6: '2' },
    { number: '3', mod3: '0', mod4: '3', mod5: '3', mod6: '3' },
    { number: '4', mod3: '1', mod4: '0', mod5: '4', mod6: '4' },
    { number: '5', mod3: '2', mod4: '1', mod5: '0', mod6: '5' },
    { number: '6', mod3: '0', mod4: '2', mod5: '1', mod6: '0' },
  ]),
}));

// Test component that uses the context
const TestComponent = () => {
  const { state, dispatch } = useData();
  
  const handleFilterChange = (column: string, value: string) => {
    dispatch({
      type: 'UPDATE_FILTER',
      payload: {
        column,
        values: [value],
      },
    });
  };
  
  return (
    <div>
      <div data-testid="data-length">{state.data.length}</div>
      <div data-testid="filtered-data-length">{state.filteredData.length}</div>
      <div data-testid="columns">{state.columns.join(',')}</div>
      
      <button 
        data-testid="filter-mod3-1"
        onClick={() => handleFilterChange('mod3', '1')}
      >
        Filter mod3=1
      </button>
      
      <button 
        data-testid="filter-mod4-2"
        onClick={() => handleFilterChange('mod4', '2')}
      >
        Filter mod4=2
      </button>
      
      <button 
        data-testid="reset-filters"
        onClick={() => dispatch({ type: 'RESET_FILTERS' })}
      >
        Reset Filters
      </button>
    </div>
  );
};

describe('DataContext', () => {
  test('loads data and initializes state', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    // Wait for useEffect to run and load data
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Should have 6 items in both data and filtered data initially
    expect(screen.getByTestId('data-length').textContent).toBe('6');
    expect(screen.getByTestId('filtered-data-length').textContent).toBe('6');
    
    // Should have all columns except 'number'
    expect(screen.getByTestId('columns').textContent).toBe('mod3,mod4,mod5,mod6');
  });
  
  test('filters data correctly', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    // Wait for useEffect to run and load data
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Filter mod3=1
    act(() => {
      screen.getByTestId('filter-mod3-1').click();
    });
    
    // Should have 2 items after filtering
    expect(screen.getByTestId('filtered-data-length').textContent).toBe('2');
    
    // Reset filters
    act(() => {
      screen.getByTestId('reset-filters').click();
    });
    
    // Should be back to 6 items
    expect(screen.getByTestId('filtered-data-length').textContent).toBe('6');
    
    // Filter mod4=2
    act(() => {
      screen.getByTestId('filter-mod4-2').click();
    });
    
    // Should have 2 items after filtering
    expect(screen.getByTestId('filtered-data-length').textContent).toBe('2');
  });
}); 