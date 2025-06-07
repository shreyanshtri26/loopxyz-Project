import React from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import { FilterOption } from '../../types';
import './FilterDropdown.css';

interface FilterDropdownProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelect: (selectedList: FilterOption[]) => void;
  onRemove: (selectedList: FilterOption[]) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  title,
  options,
  selectedValues,
  onSelect,
  onRemove,
}) => {
  // Convert selected values to FilterOption objects
  const selectedOptions = options.filter(option => 
    selectedValues.includes(option.id)
  );

  return (
    <div className="filter-dropdown">
      <h3>{title}</h3>
      <Multiselect
        options={options}
        selectedValues={selectedOptions}
        onSelect={onSelect}
        onRemove={onRemove}
        displayValue="name"
        placeholder={`Filter by ${title}`}
        showCheckbox={true}
        avoidHighlightFirstOption={true}
        closeOnSelect={false}
        style={{
          chips: {
            background: '#007bff',
          },
          multiselectContainer: {
            color: '#333',
          },
          searchBox: {
            border: '1px solid #ccc',
            borderRadius: '4px',
            minWidth: '200px',
          },
        }}
      />
    </div>
  );
};

export default FilterDropdown; 