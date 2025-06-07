import { useMemo, useCallback } from 'react';
import { DataRow, FiltersState } from '../types';

export const useFilter = (data: DataRow[], filters: FiltersState) => {
  // Create a map of all values for each column for faster lookup
  const columnValueMaps = useMemo(() => {
    const maps: Record<string, Set<string>> = {};
    
    if (data.length === 0) return maps;
    
    // Get all columns from the first row
    const columns = Object.keys(data[0]);
    
    // Initialize sets for each column
    columns.forEach(col => {
      maps[col] = new Set<string>();
    });
    
    // Populate the sets
    data.forEach(row => {
      columns.forEach(col => {
        maps[col].add(String(row[col as keyof DataRow]));
      });
    });
    
    return maps;
  }, [data]);

  // Get filtered data based on all current filters
  const filteredData = useMemo(() => {
    // Early return if no active filters
    const activeFilters = Object.entries(filters).filter(
      ([_, values]) => values && values.length > 0
    );
    
    if (activeFilters.length === 0) return data;
    
    // Convert filters to a more efficient format for lookup
    const filterMap = new Map<string, Set<string>>();
    activeFilters.forEach(([col, values]) => {
      filterMap.set(col, new Set(values));
    });
    
    return data.filter(row => {
      return Array.from(filterMap.entries()).every(([col, values]) => {
        return values.has(String(row[col as keyof DataRow]));
      });
    });
  }, [data, filters]);

  // Get all possible values for a column from the original dataset
  const getAllValuesForColumn = useCallback((column: string) => {
    const values = columnValueMaps[column] || new Set<string>();
    return Array.from(values).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
    });
  }, [columnValueMaps]);

  // Get available values for a column based on other filters
  const getAvailableValuesForColumn = useCallback((targetColumn: string) => {
    // Early return if no active filters other than the target column
    const otherActiveFilters = Object.entries(filters).filter(
      ([col, values]) => col !== targetColumn && values && values.length > 0
    );
    
    if (otherActiveFilters.length === 0) {
      return getAllValuesForColumn(targetColumn);
    }
    
    // Convert filters to a more efficient format for lookup
    const filterMap = new Map<string, Set<string>>();
    otherActiveFilters.forEach(([col, values]) => {
      filterMap.set(col, new Set(values));
    });
    
    // Filter data based on other active filters
    const relevantData = data.filter(row => {
      return Array.from(filterMap.entries()).every(([col, values]) => {
        return values.has(String(row[col as keyof DataRow]));
      });
    });
    
    // Get unique values from the filtered data
    const values = new Set<string>();
    relevantData.forEach(row => {
      values.add(String(row[targetColumn as keyof DataRow]));
    });
    
    return Array.from(values).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
    });
  }, [data, filters, getAllValuesForColumn]);

  // For each column, compute both all possible values and currently available values
  const columnOptions = useMemo(() => {
    const options: { [key: string]: { all: string[]; available: string[] } } = {};
    
    Object.keys(filters).forEach(column => {
      options[column] = {
        all: getAllValuesForColumn(column),
        available: getAvailableValuesForColumn(column)
      };
    });
    
    return options;
  }, [filters, getAllValuesForColumn, getAvailableValuesForColumn]);

  return {
    filteredData,
    columnOptions
  };
}; 