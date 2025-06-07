import React, { useMemo, useCallback } from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import { FilterDropdownProps } from '../../types';
import './FilterDropdown.css';

/**
 * FilterDropdown component that provides multi-select filtering functionality.
 * Implementation details:
 * - Uses multiselect-react-dropdown for efficient multiselect capabilities
 * - Dynamically updates available options based on current filter state
 * - Disabled options are shown but cannot be selected (maintains context)
 * - Provides search functionality to quickly find values
 * - Shows checkboxes for clear visual indication of selection state
 */
export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  column,
  selectedValues,
  columnOptions,
  onChange
}) => {
  // Convert string[] to dropdown options with memoization
  const options = useMemo(() => {
    if (!columnOptions || !columnOptions.all) return [];
    
    // Create a set of available values for faster lookup
    const availableSet = new Set(columnOptions.available);
    const selectedSet = new Set(selectedValues);
    
    // Map all possible values to options, marking them as available or not
    return columnOptions.all.map(value => ({
      name: value,
      id: value,
      disabled: !(availableSet.has(value) || selectedSet.has(value))
    }));
  }, [columnOptions, selectedValues]);

  // Selected options memoization
  const selectedOptions = useMemo(() => {
    if (!selectedValues || selectedValues.length === 0) return [];
    
    return options.filter(option => selectedValues.includes(option.id));
  }, [selectedValues, options]);

  // Handle selection with useCallback for performance
  const handleSelect = useCallback((selectedList: any[]) => {
    const newValues = selectedList.map(item => item.id);
    onChange(column, newValues);
  }, [column, onChange]);

  // Handle removal with useCallback for performance
  const handleRemove = useCallback((selectedList: any[]) => {
    const newValues = selectedList.map(item => item.id);
    onChange(column, newValues);
  }, [column, onChange]);

  return (
    <div className="filter-dropdown">
      <Multiselect
        options={options}
        selectedValues={selectedOptions}
        onSelect={handleSelect}
        onRemove={handleRemove}
        displayValue="name"
        placeholder={`Select ${column}...`}
        emptyRecordMsg="No options available"
        showCheckbox={true}
        avoidHighlightFirstOption={true}
        style={{
          chips: { background: '#f0c14b' },
          searchBox: { border: '1px solid #ddd', borderRadius: '4px', padding: '8px' },
          inputField: { margin: '5px' },
          optionContainer: { maxHeight: '300px' }
        }}
      />
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(FilterDropdown); 