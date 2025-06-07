import React, { useMemo, useCallback } from 'react';
import Select, { OptionProps } from 'react-select';
import { FilterDropdownProps, FilterOption } from '../../types';
import './FilterDropdown.css';

// Define a proper interface for the option with isAvailable property
interface ExtendedFilterOption extends FilterOption {
  isAvailable?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  column,
  selectedValues,
  columnOptions,
  onChange
}) => {
  // Convert string[] to FilterOption[] with memoization
  const options = useMemo(() => {
    if (!columnOptions || !columnOptions.all) return [];
    
    // Create a set of available values for faster lookup
    const availableSet = new Set(columnOptions.available);
    const selectedSet = new Set(selectedValues);
    
    // Map all possible values to options, marking them as available or not
    return columnOptions.all.map(value => ({
      label: value,
      value: value,
      // We'll handle this with the isOptionDisabled prop instead
      isAvailable: availableSet.has(value) || selectedSet.has(value)
    }));
  }, [columnOptions, selectedValues]);

  // Selected values memoization
  const selected = useMemo(() => {
    if (!selectedValues || selectedValues.length === 0) return [];
    
    return selectedValues.map(value => ({
      label: value,
      value: value
    }));
  }, [selectedValues]);

  // Handle change with useCallback for performance
  const handleChange = useCallback((selectedOptions: readonly FilterOption[] | null) => {
    const newValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange(column, newValues);
  }, [column, onChange]);

  // Check if an option should be disabled
  const isOptionDisabled = useCallback((option: ExtendedFilterOption) => {
    return !option.isAvailable;
  }, []);

  return (
    <div className="filter-dropdown">
      <label htmlFor={`filter-${column}`}>{column}</label>
      <Select
        inputId={`filter-${column}`}
        isMulti
        options={options}
        value={selected}
        onChange={handleChange}
        isSearchable={true}
        isClearable={true}
        placeholder={`Select ${column}...`}
        classNamePrefix="filter-select"
        maxMenuHeight={300}
        isOptionDisabled={isOptionDisabled}
      />
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(FilterDropdown); 