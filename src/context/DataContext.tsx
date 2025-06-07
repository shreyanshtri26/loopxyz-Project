import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DataRow, FiltersState, DataContextType } from '../types';
import Papa from 'papaparse';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [filters, setFilters] = useState<FiltersState>({});
  const [isLargeDataset, setIsLargeDataset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize setFilters to prevent unnecessary rerenders
  const memoizedSetFilters = useCallback((newFilters: FiltersState) => {
    setFilters(newFilters);
  }, []);

  // Use a worker for CSV parsing if the browser supports it
  const parseCSV = useCallback((csvText: string) => {
    return new Promise<Papa.ParseResult<DataRow>>((resolve) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        worker: true, // Use worker thread for better performance
        complete: (results) => {
          resolve(results as Papa.ParseResult<DataRow>);
        }
      });
    });
  }, []);

  const loadData = useCallback(async (isLarge: boolean) => {
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      const response = await fetch(isLarge ? '/data/dataset_large.csv' : '/data/dataset_small.csv');
      const csvText = await response.text();
      
      const result = await parseCSV(csvText);
      
      setData(result.data);
      
      // Initialize filters based on columns
      const initialFilters: FiltersState = {};
      if (result.meta.fields) {
        result.meta.fields.forEach((field: string) => {
          initialFilters[field] = [];
        });
      }
      setFilters(initialFilters);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [parseCSV]);

  useEffect(() => {
    loadData(isLargeDataset);
  }, [isLargeDataset, loadData]);

  const toggleDataset = useCallback(() => {
    setIsLargeDataset(prev => !prev);
  }, []);

  // Memoize context value to prevent unnecessary rerenders
  const value = useMemo(() => ({
    data,
    filters,
    setFilters: memoizedSetFilters,
    isLargeDataset,
    toggleDataset,
    loading,
    error
  }), [data, filters, memoizedSetFilters, isLargeDataset, toggleDataset, loading, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}; 