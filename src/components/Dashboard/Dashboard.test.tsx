import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { DataProvider } from '../../context/DataContext';
import { useData } from '../../context/DataContext';
import { useFilter } from '../../hooks/useFilter';
import { SmallDataRow } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { DataTable } from '../DataTable/DataTable';
import { FilterDropdown } from '../FilterDropdown/FilterDropdown';

// Mock the useData hook
jest.mock('../../context/DataContext', () => ({
  ...jest.requireActual('../../context/DataContext'),
  useData: jest.fn(),
}));

// Mock the useFilter hook
jest.mock('../../hooks/useFilter', () => ({
  useFilter: jest.fn(),
}));

// Mock child components
jest.mock('../FilterDropdown/FilterDropdown', () => ({
  FilterDropdown: jest.fn(() => <div data-testid="mock-filter-dropdown" />),
}));

jest.mock('../DataTable/DataTable', () => ({
  DataTable: jest.fn(({ data }) => (
    <div data-testid="mock-data-table">
      Showing {data.length} rows
    </div>
  )),
}));

jest.mock('../LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: jest.fn(() => <div data-testid="mock-loading-spinner" />),
}));

describe('Dashboard', () => {
  // Default mock data
  const mockData: SmallDataRow[] = [
    { number: 1, mod3: 1, mod4: 1, mod5: 1, mod6: 1 },
    { number: 2, mod3: 2, mod4: 2, mod5: 2, mod6: 2 },
  ];
  
  // Default mock filters
  const mockFilters = {
    number: [],
    mod3: [],
    mod4: [],
    mod5: [],
    mod6: [],
  };
  
  // Default mock column options
  const mockColumnOptions = {
    number: { all: ['1', '2'], available: ['1', '2'] },
    mod3: { all: ['1', '2'], available: ['1', '2'] },
    mod4: { all: ['1', '2'], available: ['1', '2'] },
    mod5: { all: ['1', '2'], available: ['1', '2'] },
    mod6: { all: ['1', '2'], available: ['1', '2'] },
  };
  
  // Setup the mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useData hook implementation
    (useData as jest.Mock).mockReturnValue({
      data: mockData,
      filters: mockFilters,
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: jest.fn(),
      loading: false,
      error: null,
    });
    
    // Mock useFilter hook implementation
    (useFilter as jest.Mock).mockReturnValue({
      filteredData: mockData,
      columnOptions: mockColumnOptions,
    });
  });
  
  test('renders without crashing', () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    expect(screen.getByText('Data Analysis Dashboard')).toBeInTheDocument();
  });
  
  test('displays loading spinner when loading', () => {
    (useData as jest.Mock).mockReturnValue({
      data: [],
      filters: {},
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: jest.fn(),
      loading: true,
      error: null,
    });
    
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    expect(screen.getByTestId('mock-loading-spinner')).toBeInTheDocument();
  });
  
  test('displays error message when there is an error', () => {
    (useData as jest.Mock).mockReturnValue({
      data: [],
      filters: {},
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: jest.fn(),
      loading: false,
      error: 'Test error message',
    });
    
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
  
  test('clicking dataset toggle button calls toggleDataset', () => {
    const mockToggleDataset = jest.fn();
    
    (useData as jest.Mock).mockReturnValue({
      data: mockData,
      filters: mockFilters,
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: mockToggleDataset,
      loading: false,
      error: null,
    });
    
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    const toggleButton = screen.getByText('Switch to Large Dataset');
    fireEvent.click(toggleButton);
    
    expect(mockToggleDataset).toHaveBeenCalledTimes(1);
  });
  
  test('clicking retry button in error state calls toggleDataset', () => {
    const mockToggleDataset = jest.fn();
    
    (useData as jest.Mock).mockReturnValue({
      data: [],
      filters: {},
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: mockToggleDataset,
      loading: false,
      error: 'Test error',
    });
    
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(mockToggleDataset).toHaveBeenCalledTimes(1);
  });
  
  test('correctly displays dataset size in toggle button', () => {
    // Small dataset
    (useData as jest.Mock).mockReturnValue({
      data: mockData,
      filters: mockFilters,
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: jest.fn(),
      loading: false,
      error: null,
    });
    
    const { rerender } = render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    expect(screen.getByText('Switch to Large Dataset')).toBeInTheDocument();
    
    // Large dataset
    (useData as jest.Mock).mockReturnValue({
      data: mockData,
      filters: mockFilters,
      setFilters: jest.fn(),
      isLargeDataset: true,
      toggleDataset: jest.fn(),
      loading: false,
      error: null,
    });
    
    rerender(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    expect(screen.getByText('Switch to Small Dataset')).toBeInTheDocument();
  });
  
  test('displays correct number of filtered records', () => {
    const filteredData = [mockData[0]]; // Just one record
    
    (useFilter as jest.Mock).mockReturnValue({
      filteredData: filteredData,
      columnOptions: mockColumnOptions,
    });
    
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    expect(screen.getByText('Showing 1 of 2 records')).toBeInTheDocument();
  });
  
  test('renders filter sections for each column', () => {
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    // Should have a filter section for each column
    expect(screen.getByText('number')).toBeInTheDocument();
    expect(screen.getByText('mod3')).toBeInTheDocument();
    expect(screen.getByText('mod4')).toBeInTheDocument();
    expect(screen.getByText('mod5')).toBeInTheDocument();
    expect(screen.getByText('mod6')).toBeInTheDocument();
  });
  
  test('clicking reset filters button calls setFilters with empty values', () => {
    const mockSetFilters = jest.fn();
    
    (useData as jest.Mock).mockReturnValue({
      data: mockData,
      filters: mockFilters,
      setFilters: mockSetFilters,
      isLargeDataset: false,
      toggleDataset: jest.fn(),
      loading: false,
      error: null,
    });
    
    render(
      <DataProvider>
        <Dashboard />
      </DataProvider>
    );
    
    const resetButton = screen.getByText('Reset Filters');
    fireEvent.click(resetButton);
    
    expect(mockSetFilters).toHaveBeenCalledWith({
      number: [],
      mod3: [],
      mod4: [],
      mod5: [],
      mod6: [],
    });
  });
  
  test('passes filteredData to DataTable', () => {
    render(<Dashboard />);
    
    expect(DataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockData
      }),
      expect.anything()
    );
  });
  
  test('calls loadData on initial render', () => {
    render(<Dashboard />);
    
    expect(useData).toHaveBeenCalledWith('small');
  });
  
  test('loads large dataset when toggle button is clicked', () => {
    render(<Dashboard />);
    
    const toggleButton = screen.getByText('Switch to Large Dataset');
    fireEvent.click(toggleButton);
    
    expect(useData).toHaveBeenCalledWith('large');
  });

  test('renders correct dataset toggle button text for small dataset', () => {
    (useData as jest.Mock).mockReturnValue({
      data: mockData,
      filters: mockFilters,
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: jest.fn(),
      loading: false,
      error: null,
    });
    
    render(<Dashboard />);
    
    expect(screen.getByText('Switch to Large Dataset')).toBeInTheDocument();
  });
  
  test('renders correct dataset toggle button text for large dataset', () => {
    (useData as jest.Mock).mockReturnValue({
      data: mockData,
      filters: mockFilters,
      setFilters: jest.fn(),
      isLargeDataset: true,
      toggleDataset: jest.fn(),
      loading: false,
      error: null,
    });
    
    render(<Dashboard />);
    
    expect(screen.getByText('Switch to Small Dataset')).toBeInTheDocument();
  });
  
  test('does not display DataTable when loading', () => {
    (useData as jest.Mock).mockReturnValue({
      data: [],
      filters: {},
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: jest.fn(),
      loading: true,
      error: null,
    });
    
    render(<Dashboard />);
    
    expect(DataTable).not.toHaveBeenCalled();
  });
  
  
  test('reset filters button calls resetFilters', () => {
    render(<Dashboard />);
    
    const resetButton = screen.getByText('Reset Filters');
    fireEvent.click(resetButton);
    
    expect(useFilter).toHaveBeenCalledWith({
      number: [],
      mod3: [],
      mod4: [],
      mod5: [],
      mod6: [],
    });
  });
  
  test('FilterDropdown receives handleFilterChange prop', () => {
    render(<Dashboard />);
    
    expect(FilterDropdown).toHaveBeenCalledWith(
      expect.objectContaining({
        onFilterChange: useFilter
      }),
      expect.anything()
    );
  });
  
  test('loads data only once on initial render', () => {
    render(<Dashboard />);
    
    expect(useData).toHaveBeenCalledTimes(1);
    
    // Re-render should not trigger loadData again
    render(<Dashboard />);
    
    expect(useData).toHaveBeenCalledTimes(1);
  });
  
  test('displays no data message when data is empty and not loading', () => {
    (useData as jest.Mock).mockReturnValue({
      data: [],
      filters: {},
      setFilters: jest.fn(),
      isLargeDataset: false,
      toggleDataset: jest.fn(),
      loading: false,
      error: null,
    });
    
    (useFilter as jest.Mock).mockReturnValue({
      filteredData: [],
      columnOptions: mockColumnOptions,
    });
    
    render(<Dashboard />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
  
  test('dashboard contains header section', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
  });
  
  test('dashboard contains filter section', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('filter-section')).toBeInTheDocument();
  });
  
  test('dashboard contains content section', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('content-section')).toBeInTheDocument();
  });
}); 