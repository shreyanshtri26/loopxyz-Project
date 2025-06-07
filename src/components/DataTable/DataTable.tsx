import React, { useMemo, useState } from 'react';
import DataTableComponent from 'react-data-table-component';
import { DataTableProps, DataRow } from '../../types';
import './DataTable.css';

/**
 * DataTable component that shows data in a paginated table.
 * Implementation details:
 * - Paginates data into pages of 100 rows each (configurable via pageSize prop)
 * - Displays data in a scrollable container showing ~20 rows at a time
 * - Uses fixed header that stays visible while scrolling
 * - Provides pagination controls to navigate between pages
 * - Sortable columns by clicking on column headers
 * - Includes row numbers for better reference
 */
export const DataTable: React.FC<DataTableProps> = ({
  data,
  pageSize = 100,
  loading = false
}) => {
  // Track current page for row numbering
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize columns to prevent recalculation
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    
    // Add row number column first
    return [
      {
        name: '#',
        // Use a cell renderer instead of selector for row numbers
        cell: (row: DataRow, index: number) => (
          <div className="row-number">
            {(currentPage - 1) * pageSize + index + 1}
          </div>
        ),
        sortable: false,
        width: '100px',
        ignoreRowClick: true,
      },
      // Then add all other columns from the data
      ...Object.keys(data[0]).map(key => ({
        name: key,
        selector: (row: DataRow) => row[key as keyof DataRow],
        sortable: true,
      }))
    ];
  }, [data, currentPage, pageSize]);

  // Handle page change for row numbering
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Custom styles for the data table
  const customStyles = {
    rows: {
      style: {
        minHeight: '35px',
      },
    },
    headCells: {
      style: {
        fontWeight: 'bold',
        backgroundColor: '#f7f7f7',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    table: {
      style: {
        height: '700px', // This will ensure the table body scrolls
      },
    },
  };

  // Empty state component
  const NoDataComponent = () => (
    <div className="no-data">No data available</div>
  );

  // Progress component for loading state
  const ProgressComponent = () => (
    <div className="loading-data">Loading...</div>
  );

  return (
    <div className="data-table-container">
      <DataTableComponent
        columns={columns}
        data={data}
        pagination
        paginationPerPage={pageSize}
        paginationRowsPerPageOptions={[100]}
        onChangePage={handlePageChange}
        progressPending={loading}
        progressComponent={<ProgressComponent />}
        noDataComponent={<NoDataComponent />}
        customStyles={customStyles}
        fixedHeader
        fixedHeaderScrollHeight="700px"
        highlightOnHover
        pointerOnHover
        responsive
        className="rdt-table-wrapper"
        paginationComponentOptions={{
          rowsPerPageText: 'Rows per page:',
          rangeSeparatorText: 'of',
        }}
      />
    </div>
  );
}; 