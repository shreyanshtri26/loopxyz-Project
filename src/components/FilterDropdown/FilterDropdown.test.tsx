import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterDropdown } from './FilterDropdown';

// Mock react-select
jest.mock('react-select', () => ({ 
  __esModule: true, 
  default: ({ inputId, options, value, placeholder, onChange, isMulti, isClearable, isSearchable }: any) => (
    <div data-testid="mock-select">
      <label htmlFor={inputId}>{placeholder}</label>
      <select 
        id={inputId} 
        data-testid="select" 
        multiple={isMulti}
        onChange={(e) => {
          // Simulate react-select's onChange behavior
          const selectedOption = options.find((opt: any) => opt.value === e.target.value);
          onChange(isMulti ? [...(value || []), selectedOption] : selectedOption);
        }}
      >
        {options.map((opt: any) => (
          <option 
            key={opt.value} 
            value={opt.value}
            disabled={opt.isDisabled}
            data-testid={`option-${opt.value}`}
          >
            {opt.label}
          </option>
        ))}
      </select>
      <div data-testid="selected-values">
        {value && (Array.isArray(value) ? value : [value]).map((v: any) => (
          <span key={v.value} data-testid={`selected-${v.value}`}>{v.label}</span>
        ))}
      </div>
      {isClearable && (
        <button 
          data-testid="clear-button"
          onClick={() => onChange(isMulti ? [] : null)}
        >
          Clear
        </button>
      )}
      {isSearchable && <input data-testid="search-input" placeholder="Search..." />}
    </div>
  )
}));

describe('FilterDropdown', () => {
  const mockProps = {
    column: 'mod3',
    selectedValues: ['1', '2'],
    columnOptions: {
      all: ['0', '1', '2'],
      available: ['1', '2']
    },
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct column name', () => {
    render(<FilterDropdown {...mockProps} />);
    expect(screen.getByText(/Select mod3.../i)).toBeInTheDocument();
  });

  it('renders selected values', () => {
    render(<FilterDropdown {...mockProps} />);
    expect(screen.getByTestId('selected-1')).toBeInTheDocument();
    expect(screen.getByTestId('selected-2')).toBeInTheDocument();
  });

  it('renders all options from columnOptions.all', () => {
    render(<FilterDropdown {...mockProps} />);
    expect(screen.getByTestId('option-0')).toBeInTheDocument();
    expect(screen.getByTestId('option-1')).toBeInTheDocument();
    expect(screen.getByTestId('option-2')).toBeInTheDocument();
  });

  it('disables unavailable options', () => {
    render(<FilterDropdown {...mockProps} />);
    const option0 = screen.getByTestId('option-0') as HTMLOptionElement;
    expect(option0.disabled).toBe(true);
  });

  it('calls onChange when a value is selected', () => {
    render(<FilterDropdown {...mockProps} />);
    const selectElement = screen.getByTestId('select');
    
    fireEvent.change(selectElement, { target: { value: '0' } });
    
    expect(mockProps.onChange).toHaveBeenCalledWith(['1', '2', '0']);
  });

  it('should be multi-selectable', () => {
    render(<FilterDropdown {...mockProps} />);
    const selectElement = screen.getByTestId('select') as HTMLSelectElement;
    
    expect(selectElement.multiple).toBe(true);
  });

  it('should be clearable', () => {
    render(<FilterDropdown {...mockProps} />);
    
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('should be searchable', () => {
    render(<FilterDropdown {...mockProps} />);
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('clears selected values when clear button is clicked', () => {
    render(<FilterDropdown {...mockProps} />);
    
    fireEvent.click(screen.getByTestId('clear-button'));
    
    expect(mockProps.onChange).toHaveBeenCalledWith([]);
  });

  it('handles empty selectedValues array', () => {
    render(<FilterDropdown {...mockProps} selectedValues={[]} />);
    
    // Should not display any selected values
    expect(screen.queryByTestId(/^selected-/)).not.toBeInTheDocument();
  });

  it('handles empty columnOptions', () => {
    render(
      <FilterDropdown 
        {...mockProps} 
        columnOptions={{ all: [], available: [] }} 
      />
    );
    
    // Should not render any options
    expect(screen.queryByTestId(/^option-/)).not.toBeInTheDocument();
  });

  it('correctly formats numeric options', () => {
    const numericProps = {
      ...mockProps,
      columnOptions: {
        all: ['0', '1', '10', '2'],
        available: ['1', '2', '10']
      }
    };
    
    render(<FilterDropdown {...numericProps} />);
    
    // Options should be available
    expect(screen.getByTestId('option-0')).toBeInTheDocument();
    expect(screen.getByTestId('option-1')).toBeInTheDocument();
    expect(screen.getByTestId('option-2')).toBeInTheDocument();
    expect(screen.getByTestId('option-10')).toBeInTheDocument();
  });

  it('handles large number of options efficiently', () => {
    // Create props with 100 options
    const largeProps = {
      ...mockProps,
      columnOptions: {
        all: Array.from({ length: 100 }, (_, i) => i.toString()),
        available: Array.from({ length: 50 }, (_, i) => (i * 2).toString())
      }
    };
    
    render(<FilterDropdown {...largeProps} />);
    
    // Sample a few options to verify they're rendered
    expect(screen.getByTestId('option-0')).toBeInTheDocument();
    expect(screen.getByTestId('option-50')).toBeInTheDocument();
    expect(screen.getByTestId('option-99')).toBeInTheDocument();
    
    // Verify disabled status of a few options
    const option1 = screen.getByTestId('option-1') as HTMLOptionElement;
    expect(option1.disabled).toBe(true);
    
    const option2 = screen.getByTestId('option-2') as HTMLOptionElement;
    expect(option2.disabled).toBe(false);
  });
}); 