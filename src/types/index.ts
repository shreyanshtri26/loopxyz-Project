export interface BaseDataRow {
  number: number;
  [key: string]: number;
}

export interface SmallDataRow extends BaseDataRow {
  mod3: number;
  mod4: number;
  mod5: number;
  mod6: number;
}

export interface LargeDataRow extends BaseDataRow {
  mod350: number;
  mod8000: number;
  mod20002: number;
}

export type DataRow = SmallDataRow | LargeDataRow;

export interface FiltersState {
  [key: string]: string[];
}

export interface FilterOption {
  label: string;
  value: string;
  isDisabled?: boolean;
  isAvailable?: boolean;
}

export interface ColumnOptions {
  all: string[];
  available: string[];
}

export interface FilterDropdownProps {
  column: string;
  selectedValues: string[];
  columnOptions: ColumnOptions;
  onChange: (column: string, values: string[]) => void;
}

export interface DataTableProps {
  data: DataRow[];
  pageSize?: number;
  virtualScrollSize?: number;
  loading?: boolean;
}

export interface DataContextType {
  data: DataRow[];
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  isLargeDataset: boolean;
  toggleDataset: () => void;
  loading: boolean;
  error: string | null;
}

export type ActionType =
  | { type: 'SET_DATA'; payload: { data: DataRow[]; isLargeDataset: boolean } }
  | { type: 'UPDATE_FILTER'; payload: { column: string; values: string[] } }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_DATASET' }; 