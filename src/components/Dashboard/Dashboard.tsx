import React, { useEffect, useCallback } from 'react';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import DataTableComponent from '../DataTable/DataTable';
import { useData } from '../../context/DataContext';
import { FilterOption } from '../../types';
import './Dashboard.css';

interface DashboardProps {
  useSmallDataset?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ useSmallDataset = true }) => {
  const { state, dispatch, loadData } = useData();
  const { filteredData, filters, availableOptions, columns, isLargeDataset } = state;

  useEffect(() => {
    // Load data when component mounts
    loadData(!useSmallDataset);
  }, [loadData, useSmallDataset]);

  const handleFilterSelect = useCallback((selectedList: FilterOption[], column: string) => {
    dispatch({
      type: 'UPDATE_FILTER',
      payload: {
        column,
        values: selectedList.map(item => item.id),
      },
    });
  }, [dispatch]);

  const handleFilterRemove = useCallback((selectedList: FilterOption[], column: string) => {
    dispatch({
      type: 'UPDATE_FILTER',
      payload: {
        column,
        values: selectedList.map(item => item.id),
      },
    });
  }, [dispatch]);

  const handleResetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, [dispatch]);

  const handleDatasetToggle = useCallback(() => {
    loadData(!isLargeDataset);
  }, [loadData, isLargeDataset]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Business Intelligence Dashboard</h1>
        <div className="dashboard-actions">
          <button 
            className="dataset-toggle" 
            onClick={handleDatasetToggle}
          >
            Switch to {isLargeDataset ? 'Small' : 'Large'} Dataset
          </button>
          <button 
            className="reset-filters" 
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="filters-section">
          <h2>Filters</h2>
          <div className="filters-container">
            {columns.map(column => (
              <FilterDropdown
                key={column}
                title={column}
                options={availableOptions[column] || []}
                selectedValues={filters[column] || []}
                onSelect={(selectedList) => handleFilterSelect(selectedList, column)}
                onRemove={(selectedList) => handleFilterRemove(selectedList, column)}
              />
            ))}
          </div>
        </div>
        
        <div className="table-section">
          <h2>Data Table</h2>
          <p>Showing {filteredData.length} of {state.data.length} rows</p>
          <DataTableComponent
            data={filteredData}
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 