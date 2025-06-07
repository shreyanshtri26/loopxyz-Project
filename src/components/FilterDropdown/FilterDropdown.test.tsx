import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterDropdown } from './FilterDropdown';
import { Multiselect } from 'multiselect-react-dropdown';

// Create a mock implementation that captures the props
let capturedProps: any = null;
const mockedMultiselect = jest.fn((props) => {
  capturedProps = props;
  return <div data-testid="mock-multiselect">Mock Multiselect</div>;
});

jest.mock('multiselect-react-dropdown', () => ({
  Multiselect: mockedMultiselect,
}));

describe('FilterDropdown', () => {
  // Props for the FilterDropdown component
  const mockProps = {
    column: 'testColumn',
    selectedValues: ['value1'],
    columnOptions: {
      all: ['value1', 'value2', 'value3'],
      available: ['value1', 'value2'],
    },
    onChange: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    capturedProps = null;
  });
  
  test('renders correctly', () => {
    render(<FilterDropdown {...mockProps} />);
    
    expect(screen.getByText('testColumn')).toBeInTheDocument();
    expect(screen.getByTestId('mock-multiselect')).toBeInTheDocument();
  });
  
  test('passes correct props to Multiselect', () => {
    render(<FilterDropdown {...mockProps} />);
    
    expect(mockedMultiselect).toHaveBeenCalledWith(
      expect.objectContaining({
        options: mockProps.columnOptions.available,
        selectedValues: mockProps.selectedValues,
        onSelect: expect.any(Function),
        onRemove: expect.any(Function),
      }),
      expect.anything()
    );
  });
  
  test('handles selection changes', () => {
    render(<FilterDropdown {...mockProps} />);
    
    // Ensure the mock was called and props were captured
    expect(mockedMultiselect).toHaveBeenCalled();
    expect(capturedProps).not.toBeNull();
    expect(capturedProps.onSelect).toBeDefined();
    
    // Call the onSelect function with test values
    capturedProps.onSelect(['value1', 'value2']);
    
    expect(mockProps.onChange).toHaveBeenCalledWith('testColumn', ['value1', 'value2']);
  });
  
  test('handles value removal', () => {
    render(<FilterDropdown {...mockProps} />);
    
    // Ensure the mock was called and props were captured
    expect(mockedMultiselect).toHaveBeenCalled();
    expect(capturedProps).not.toBeNull();
    expect(capturedProps.onRemove).toBeDefined();
    
    // Call the onRemove function with test values
    capturedProps.onRemove(['value1']);
    
    expect(mockProps.onChange).toHaveBeenCalledWith('testColumn', []);
  });
}); 