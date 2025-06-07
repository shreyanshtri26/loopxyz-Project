import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import { DataContextState, DataRow, FiltersState, FilterOption, ActionType } from '../types';
import { fetchCSV } from '../utils/csvParser';

// Initial state
const initialState: DataContextState = {
  data: [],
  filteredData: [],
  filters: {},
  availableOptions: {},
  columns: [],
  isLargeDataset: false,
};

// Reducer function
const reducer = (state: DataContextState, action: ActionType): DataContextState => {
  switch (action.type) {
    case 'SET_DATA': {
      const { data, isLargeDataset } = action.payload;
      const columns = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'number') : [];
      
      // Initialize filters
      const filters: FiltersState = {};
      columns.forEach(column => {
        filters[column] = [];
      });
      
      // Get unique values for each column
      const availableOptions: { [key: string]: FilterOption[] } = {};
      columns.forEach(column => {
        const uniqueValues = [...new Set(data.map(row => row[column as keyof DataRow]))];
        availableOptions[column] = uniqueValues.map(value => ({
          name: value,
          id: value,
        }));
      });
      
      return {
        ...state,
        data,
        filteredData: data,
        filters,
        columns,
        availableOptions,
        isLargeDataset,
      };
    }
    
    case 'UPDATE_FILTER': {
      const { column, values } = action.payload;
      const newFilters = { ...state.filters, [column]: values };
      
      // Filter data based on all filters
      const filteredData = state.data.filter(row => {
        return Object.entries(newFilters).every(([col, selectedValues]) => {
          if (selectedValues.length === 0) return true;
          return selectedValues.includes(row[col as keyof DataRow] as string);
        });
      });
      
      // Update available options for each column based on filtered data
      const availableOptions: { [key: string]: FilterOption[] } = {};
      state.columns.forEach(col => {
        // Apply filters except the current column's filter
        const dataFilteredByOtherColumns = state.data.filter(row => {
          return Object.entries(newFilters).every(([filterCol, selectedValues]) => {
            if (filterCol === col || selectedValues.length === 0) return true;
            return selectedValues.includes(row[filterCol as keyof DataRow] as string);
          });
        });
        
        // Get unique values from filtered data
        const uniqueValues = [...new Set(dataFilteredByOtherColumns.map(row => row[col as keyof DataRow]))];
        availableOptions[col] = uniqueValues.map(value => ({
          name: value,
          id: value,
        }));
      });
      
      return {
        ...state,
        filters: newFilters,
        filteredData,
        availableOptions,
      };
    }
    
    case 'RESET_FILTERS': {
      const resetFilters: FiltersState = {};
      state.columns.forEach(column => {
        resetFilters[column] = [];
      });
      
      // Get unique values for each column from all data
      const availableOptions: { [key: string]: FilterOption[] } = {};
      state.columns.forEach(column => {
        const uniqueValues = [...new Set(state.data.map(row => row[column as keyof DataRow]))];
        availableOptions[column] = uniqueValues.map(value => ({
          name: value,
          id: value,
        }));
      });
      
      return {
        ...state,
        filters: resetFilters,
        filteredData: state.data,
        availableOptions,
      };
    }
    
    default:
      return state;
  }
};

// Create context
const DataContext = createContext<{
  state: DataContextState;
  dispatch: React.Dispatch<ActionType>;
  loadData: (isLarge: boolean) => Promise<void>;
}>({
  state: initialState,
  dispatch: () => null,
  loadData: async () => {},
});

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const loadData = async (isLarge: boolean) => {
    const filePath = isLarge ? './data/dataset_large.csv' : './data/dataset_small.csv';
    const data = await fetchCSV(filePath);
    dispatch({ 
      type: 'SET_DATA', 
      payload: { 
        data, 
        isLargeDataset: isLarge 
      } 
    });
  };
  
  const value = useMemo(() => ({
    state,
    dispatch,
    loadData,
  }), [state]);
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 