import React, { useCallback, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { useFilter } from '../../hooks/useFilter';
import { FilterDropdown } from '../FilterDropdown/FilterDropdown';
import { DataTable } from '../DataTable/DataTable';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { data, filters, setFilters, isLargeDataset, toggleDataset, loading, error } = useData();
  const { filteredData, columnOptions } = useFilter(data, filters);

  // Memoize the filter change handler
  const handleFilterChange = useCallback(
    (column: string, values: string[]) => {
      setFilters({ ...filters, [column]: values });
    },
    [filters, setFilters]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    const emptyFilters = Object.keys(filters).reduce((acc, column) => {
      acc[column] = [];
      return acc;
    }, {} as Record<string, string[]>);
    setFilters(emptyFilters);
  }, [filters, setFilters]);

  // Memoize filter components to prevent unnecessary rerenders
  const filterComponents = useMemo(() => {
    const filterSections = Object.keys(filters).map(column => (
      <div key={column} className="filter-section">
        <h3>{column}</h3>
        <FilterDropdown
          column={column}
          selectedValues={filters[column]}
          columnOptions={columnOptions[column]}
          onChange={handleFilterChange}
        />
      </div>
    ));

    return (
      <div className="filters-sidebar">
        <div className="filters-header">
          <h2>Filters</h2>
          <button onClick={resetFilters} className="dataset-toggle">Reset Filters</button>
        </div>
        <div className="filters-container">
          {filterSections}
        </div>
      </div>
    );
  }, [filters, columnOptions, handleFilterChange, resetFilters]);

  // Memoize result summary
  const resultSummary = useMemo(() => (
    <div className="results-summary">
      Showing {filteredData.length} of {data.length} records
    </div>
  ), [filteredData.length, data.length]);

  // Memoize data table to prevent unnecessary rerenders
  const dataTable = useMemo(() => (
    <DataTable
      data={filteredData}
      pageSize={100}
      loading={loading}
    />
  ), [filteredData, loading]);

  // Show loading spinner during data loading
  if (loading) {
    return <LoadingSpinner size="large" message="Loading data..." />;
  }

  // Show error message if data loading failed
  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading data</h2>
        <p>{error}</p>
        <button onClick={() => toggleDataset()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Data Analysis Dashboard</h1>
        <button onClick={toggleDataset} className="dataset-toggle">
          Switch to {isLargeDataset ? 'Small' : 'Large'} Dataset
        </button>
      </div>

      <div className="dashboard-content">
        {filterComponents}
        
        <div className="data-container">
          {resultSummary}
          {dataTable}
        </div>
      </div>
    </div>
  );
}; 