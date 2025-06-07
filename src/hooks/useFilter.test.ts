import { renderHook } from '@testing-library/react';
import { useFilter } from './useFilter';
import { DataRow, FiltersState } from '../types';

describe('useFilter hook', () => {
  // Mock data for testing
  const mockData: DataRow[] = [
    { number: 12, mod3: 0, mod4: 0, mod5: 2, mod6: 0 },
    { number: 24, mod3: 0, mod4: 0, mod5: 4, mod6: 0 },
    { number: 15, mod3: 0, mod4: 3, mod5: 0, mod6: 3 },
    { number: 10, mod3: 1, mod4: 2, mod5: 0, mod6: 4 },
    { number: 11, mod3: 2, mod4: 3, mod5: 1, mod6: 5 },
  ];

  // Test that the hook returns the correct data when no filters are applied
  it('returns all data when no filters are applied', () => {
    const filters: FiltersState = {
      mod3: [],
      mod4: [],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    expect(result.current.filteredData).toEqual(mockData);
    expect(result.current.filteredData.length).toBe(5);
  });

  // Test that the hook filters data correctly when a single filter is applied
  it('filters data correctly when a single filter is applied', () => {
    const filters: FiltersState = {
      mod3: ['0'],
      mod4: [],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    expect(result.current.filteredData.length).toBe(3);
    expect(result.current.filteredData.every(item => item.mod3 === 0)).toBe(true);
  });

  // Test that the hook filters data correctly when multiple filters are applied
  it('filters data correctly when multiple filters are applied', () => {
    const filters: FiltersState = {
      mod3: ['0'],
      mod4: ['0'],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    expect(result.current.filteredData.length).toBe(2);
    expect(result.current.filteredData.every(item => item.mod3 === 0 && item.mod4 === 0)).toBe(true);
  });

  // Test that the hook returns the correct column options
  it('returns correct column options', () => {
    const filters: FiltersState = {
      mod3: [],
      mod4: [],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    // Check that all unique values are returned for mod3
    expect(result.current.columnOptions.mod3.all.sort()).toEqual(['0', '1', '2'].sort());
    
    // Check that all values are available when no filters are applied
    expect(result.current.columnOptions.mod3.available.sort()).toEqual(['0', '1', '2'].sort());
  });

  // Test that the hook updates available options when filters are applied
  it('updates available options when filters are applied', () => {
    const filters: FiltersState = {
      mod3: [],
      mod4: ['0'],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    // When mod4=0 is selected, only mod3=0 should be available
    expect(result.current.columnOptions.mod3.available).toEqual(['0']);
  });

  // Test that the hook handles empty data array
  it('handles empty data array', () => {
    const filters: FiltersState = {
      mod3: [],
      mod4: [],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter([], filters));

    expect(result.current.filteredData).toEqual([]);
    expect(Object.keys(result.current.columnOptions)).toEqual(['mod3', 'mod4', 'mod5', 'mod6']);
    expect(result.current.columnOptions.mod3.all).toEqual([]);
  });

  // Test that the hook handles multiple selected values for a filter
  it('handles multiple selected values for a filter', () => {
    const filters: FiltersState = {
      mod3: ['0', '1'],
      mod4: [],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    expect(result.current.filteredData.length).toBe(4);
    expect(result.current.filteredData.every(item => item.mod3 === 0 || item.mod3 === 1)).toBe(true);
  });

  // Test filter interactions between multiple columns
  it('correctly filters with interactions between multiple columns', () => {
    const filters: FiltersState = {
      mod3: ['0'],
      mod4: ['3'],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    // Should only return rows where mod3=0 AND mod4=3
    expect(result.current.filteredData.length).toBe(1);
    expect(result.current.filteredData[0].mod3).toBe(0);
    expect(result.current.filteredData[0].mod4).toBe(3);
  });

  // Test that all columns have proper available options
  it('updates available options for all columns', () => {
    const filters: FiltersState = {
      mod3: ['0'],
      mod4: [],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    // Check available options for mod4 when mod3=0 is selected
    expect(result.current.columnOptions.mod4.available.sort()).toEqual(['0', '3'].sort());
    
    // Check available options for mod5
    expect(result.current.columnOptions.mod5.available.sort()).toEqual(['0', '2', '4'].sort());
    
    // Check available options for mod6
    expect(result.current.columnOptions.mod6.available.sort()).toEqual(['0', '3'].sort());
  });

  // Test with complex multi-column filters
  it('handles complex multi-column filtering', () => {
    const filters: FiltersState = {
      mod3: ['0', '1'],
      mod4: ['0', '2'],
      mod5: ['0'],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    // Should only include rows matching all the filter criteria
    expect(result.current.filteredData.length).toBe(1);
    expect(result.current.filteredData[0].mod3).toBe(1);
    expect(result.current.filteredData[0].mod4).toBe(2);
    expect(result.current.filteredData[0].mod5).toBe(0);
  });

  // Test edge case where no results match the filter
  it('returns empty array when no data matches filters', () => {
    const filters: FiltersState = {
      mod3: ['0'],
      mod4: ['1'], // No rows have mod3=0 AND mod4=1
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    expect(result.current.filteredData.length).toBe(0);
  });

  // Test that numeric sorting works correctly
  it('sorts numeric values correctly', () => {
    const filters: FiltersState = {
      mod3: [],
      mod4: [],
      mod5: [],
      mod6: []
    };

    const { result } = renderHook(() => useFilter(mockData, filters));

    // Values should be sorted numerically, not lexicographically
    expect(result.current.columnOptions.mod5.all).toEqual(['0', '1', '2', '4']);
  });
}); 