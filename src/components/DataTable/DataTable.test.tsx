import React from 'react';
import { render } from '@testing-library/react';
import { DataTable } from './DataTable';
import DataTableComponent from 'react-data-table-component';
import { SmallDataRow } from '../../types';

// Mock react-data-table-component
jest.mock('react-data-table-component', () => {
  return jest.fn(() => <div>Mocked DataTable</div>);
});

describe('DataTable', () => {
  const mockData: SmallDataRow[] = [
    { number: 1, mod3: 1, mod4: 1, mod5: 1, mod6: 1 },
    { number: 2, mod3: 2, mod4: 2, mod5: 2, mod6: 2 },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders data table component', () => {
    render(<DataTable data={mockData} />);
    
    expect(DataTableComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockData,
        pagination: true,
        paginationPerPage: 100,
      }),
      expect.anything()
    );
  });
  
  test('configures columns correctly', () => {
    render(<DataTable data={mockData} />);
    
    const { columns } = (DataTableComponent as jest.Mock).mock.calls[0][0];
    
    expect(columns.length).toBeGreaterThan(0);
    expect(columns[0].name).toBe('#');
    expect(columns[1].name).toBe('number');
    expect(columns[2].name).toBe('mod3');
    expect(columns[3].name).toBe('mod4');
    expect(columns[4].name).toBe('mod5');
    expect(columns[5].name).toBe('mod6');
  });
}); 