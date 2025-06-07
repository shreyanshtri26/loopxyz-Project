export interface SmallDataRow {
  number: string;
  mod3: string;
  mod4: string;
  mod5: string;
  mod6: string;
}

export interface LargeDataRow {
  number: string;
  mod350: string;
  mod8000: string;
  mod20002: string;
}

export type DataRow = SmallDataRow | LargeDataRow;

export interface FiltersState {
  [key: string]: string[];
}

export interface FilterOption {
  name: string;
  id: string;
}

export interface DataContextState {
  data: DataRow[];
  filteredData: DataRow[];
  filters: FiltersState;
  availableOptions: {
    [key: string]: FilterOption[];
  };
  columns: string[];
  isLargeDataset: boolean;
}

export type ActionType =
  | { type: 'SET_DATA'; payload: { data: DataRow[]; isLargeDataset: boolean } }
  | { type: 'UPDATE_FILTER'; payload: { column: string; values: string[] } }
  | { type: 'RESET_FILTERS' }; 