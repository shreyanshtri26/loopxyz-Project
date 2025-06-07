import React, { useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { DataRow } from '../../types';
import './DataTable.css';

interface DataTableProps {
  data: DataRow[];
  columns: string[];
}

const DataTableComponent: React.FC<DataTableProps> = ({ data, columns }) => {
  const tableColumns = useMemo(() => {
    return [
      {
        name: 'Number',
        selector: (row: DataRow) => row.number,
        sortable: true,
      },
      ...columns.map(column => ({
        name: column,
        selector: (row: DataRow) => row[column as keyof DataRow] as string,
        sortable: true,
      })),
    ];
  }, [columns]);

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontWeight: 'bold',
      },
    },
    rows: {
      style: {
        minHeight: '48px',
        '&:nth-of-type(odd)': {
          backgroundColor: '#f9f9f9',
        },
      },
    },
  };

  return (
    <div className="data-table-container">
      <DataTable
        columns={tableColumns}
        data={data}
        pagination
        paginationPerPage={100}
        paginationRowsPerPageOptions={[20, 50, 100]}
        highlightOnHover
        pointerOnHover
        striped
        responsive
        customStyles={customStyles}
        noDataComponent={<div className="no-data">No matching records found</div>}
      />
    </div>
  );
};

export default DataTableComponent; 