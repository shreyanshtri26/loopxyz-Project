# Business Intelligence Dashboard with Dynamic Filters

This project demonstrates a Business Intelligence dashboard with dynamic filters and data table. It mimics Amazon's filter functionality, where selecting a filter value updates other filters to show only relevant options.

## Features

- **Dynamic Filters**: Each column has a filter that supports search and multi-select
- **Filter Interactions**: Selecting a value in one filter updates other filters
- **Data Table**: Shows filtered data with pagination and scrolling
- **Performance**: Optimized for large datasets with efficient filtering
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- React with TypeScript
- React Data Table Component for the data table
- Multiselect React Dropdown for the filters
- Context API for state management

## Getting Started

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Usage

1. The dashboard loads with the small dataset by default
2. Use the filter dropdowns to filter the data
3. Click "Switch to Large Dataset" to test with the large dataset
4. Click "Reset Filters" to clear all filters

## Testing

Run the unit tests:
```
npm test
```

## Project Structure

- `src/components/` - React components
- `src/context/` - Data context for state management
- `src/types/` - TypeScript types and interfaces
- `src/utils/` - Utility functions
- `public/data/` - CSV data files 