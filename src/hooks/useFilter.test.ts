import { renderHook } from '@testing-library/react';
import { useFilter } from './useFilter';
import { SmallDataRow, FiltersState } from '../types';

describe('useFilter', () => {
  // Test data
  const testData: SmallDataRow[] = [
    { number: 1, mod3: 1, mod4: 1, mod5: 1, mod6: 1 },
    { number: 2, mod3: 2, mod4: 2, mod5: 2, mod6: 2 },
    { number: 3, mod3: 0, mod4: 3, mod5: 3, mod6: 3 },
    { number: 4, mod3: 1, mod4: 0, mod5: 4, mod6: 4 },
    { number: 5, mod3: 2, mod4: 1, mod5: 0, mod6: 5 },
    { number: 6, mod3: 0, mod4: 2, mod5: 1, mod6: 0 },
  ];

  test('returns all data when no filters are applied', () => {
    const filters: FiltersState = {};
    
    const { result } = renderHook(() => useFilter(testData, filters));
    
    expect(result.current.filteredData).toEqual(testData);
    expect(result.current.filteredData.length).toBe(6);
  });
  
  test('returns correct column options for available values based on other filters', () => {
    const filters: FiltersState = {
      mod3: [],
      mod6: ['0'],
    };
    
    const { result } = renderHook(() => useFilter(testData, filters));
    
    // Only rows with mod6 = 0 have mod3 values of 0 and 2
    expect(result.current.columnOptions.mod3.all).toEqual(['0', '1', '2']);
    expect(result.current.columnOptions.mod3.available).toEqual(['0', '2']);
  });
  
  test('handles empty data array', () => {
    const filters: FiltersState = {
      mod3: ['0'],
    };
    
    const { result } = renderHook(() => useFilter([], filters));
    
    expect(result.current.filteredData).toEqual([]);
    expect(result.current.columnOptions).toEqual({});
  });
  
  test('handles filtering with non-existent column', () => {
    const filters: FiltersState = {
      nonExistentColumn: ['value'],
    };
    
    const { result } = renderHook(() => useFilter(testData, filters));
    
    // Should return all data since the filter doesn't match any columns
    expect(result.current.filteredData).toEqual(testData);
  });
  
  test('updates available options correctly when filter changes', () => {
    // Initial filter
    let filters: FiltersState = {
      mod4: ['0'],
    };
    
    const { result, rerender } = renderHook(() => useFilter(testData, filters));
    
    // Check initial available options for mod3
    expect(result.current.columnOptions.mod3.available).toEqual(['1']);
    
    // Update filter to see how available options change
    filters = {
      mod4: ['0', '1'],
    };
    
    rerender();
    
    // Check updated available options for mod3
    expect(result.current.columnOptions.mod3.available).toEqual(['1', '2']);
  });
}); 