import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterDropdown } from './FilterDropdown';
import { Multiselect } from 'multiselect-react-dropdown';

// Mock the multiselect-react-dropdown component
jest.mock('multiselect-react-dropdown', () => ({
  Multiselect: jest.fn(() => <div data-testid="mock-multiselect">Mock Multiselect</div>),
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
  });
  
  test('renders correctly', () => {
    render(<FilterDropdown {...mockProps} />);
    
    expect(screen.getByText('testColumn')).toBeInTheDocument();
    expect(screen.getByTestId('mock-multiselect')).toBeInTheDocument();
  });
  
  test('passes correct props to Multiselect', () => {
    render(<FilterDropdown {...mockProps} />);
    
    expect(Multiselect).toHaveBeenCalledWith(
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
    
    const onSelectMock = (Multiselect as jest.Mock).mock.calls[0][0].onSelect;
    onSelectMock(['value1', 'value2']);
    
    expect(mockProps.onChange).toHaveBeenCalledWith('testColumn', ['value1', 'value2']);
  });
  
  test('handles value removal', () => {
    render(<FilterDropdown {...mockProps} />);
    
    const onRemoveMock = (Multiselect as jest.Mock).mock.calls[0][0].onRemove;
    onRemoveMock(['value1']);
    
    expect(mockProps.onChange).toHaveBeenCalledWith('testColumn', []);
  });
}); 