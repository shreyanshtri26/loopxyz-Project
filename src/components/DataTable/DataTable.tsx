import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { DataTableProps, DataRow } from '../../types';
import './DataTable.css';

// Interface for row renderer props from react-window
interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: DataRow[];
    columns: string[];
  };
}

// Create a memoized row component to prevent unnecessary re-renders
const MemoizedRow = React.memo(({ index, style, data }: RowProps) => {
  const { items, columns } = data;
  const item = items[index];
  
  if (!item) return null;

  return (
    <div style={style} className="table-row" role="row">
      {columns.map((column) => (
        <div key={column} className="table-cell">
          {item[column as keyof typeof item]}
        </div>
      ))}
    </div>
  );
});

export const DataTable: React.FC<DataTableProps> = ({
  data,
  pageSize = 100,
  virtualScrollSize = 20,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize columns to prevent recalculation
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Memoize paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  // Memoize total pages calculation
  const totalPages = useMemo(() => 
    Math.ceil(data.length / pageSize), 
  [data.length, pageSize]);

  // Memoize itemData for the List component
  const itemData = useMemo(() => ({
    items: paginatedData,
    columns
  }), [paginatedData, columns]);

  // Memoize header renderer
  const HeaderRenderer = useMemo(() => (
    <div className="table-header" role="row">
      {columns.map((column) => (
        <div key={column} className="table-header-cell">
          {column}
        </div>
      ))}
    </div>
  ), [columns]);

  // Memoize pagination component
  const PaginationComponent = useMemo(() => (
    <div className="pagination">
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        Previous
      </button>
      <span className="pagination-info">
        Page {currentPage} of {totalPages} ({data.length} total rows)
      </span>
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        Next
      </button>
    </div>
  ), [currentPage, totalPages, data.length]);

  // Show loading state
  if (loading) {
    return <div className="loading-data">Loading...</div>;
  }

  // Show empty state
  if (data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  return (
    <div className="data-table-container">
      {HeaderRenderer}
      <div className="data-table-body">
        <List
          height={400} // Show approximately 20 rows (20 * 35px row height)
          width="100%"
          itemCount={Math.min(pageSize, paginatedData.length)}
          itemSize={35}
          overscanCount={virtualScrollSize}
          itemData={itemData}
        >
          {MemoizedRow}
        </List>
      </div>
      {PaginationComponent}
    </div>
  );
}; 