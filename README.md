# Business Intelligence Dashboard with Dynamic Filters

This project implements an interactive Business Intelligence dashboard featuring dynamic cross-filtering capabilities. Inspired by Amazon's filtering mechanism, this application demonstrates how selecting values in one filter dynamically updates available options in other filters, showing only relevant choices based on the current data view.

## 🚀 Features

### Data Visualization
- **Interactive Data Table**: Displays filtered data with pagination (100 rows per page)
- **Virtual Scrolling**: Shows only 20 entries at a time for optimal performance
- **Real-time Updates**: Table reflects filter changes immediately

### Advanced Filtering System
- **Cross-Filter Interaction**: Selecting values in one filter updates options in other filters
- **Multi-select Capability**: Select multiple values within each filter
- **Search Functionality**: Quickly find specific values within each dropdown
- **Disabled Options**: Unavailable options are shown but disabled, maintaining context

### Performance Optimizations
- **Efficient Filtering Algorithm**: Uses Set operations for O(1) lookups
- **Memoization**: Prevents unnecessary recalculations with React's useMemo and useCallback
- **Virtual Rendering**: Only renders visible rows for better performance with large datasets
- **Worker-based CSV Parsing**: Offloads heavy parsing operations to worker threads

### User Experience
- **Amazon-style Layout**: Filters on the left, data table on the right
- **Responsive Design**: Works on various screen sizes
- **Dataset Toggle**: Switch between small and large datasets for testing
- **Clear Visual Feedback**: Shows which options are selected, available, or disabled

## 🔧 Technology Stack

- **React 18**: For building the user interface
- **TypeScript**: For type safety and better developer experience
- **Context API**: For global state management
- **React Window**: For efficient virtual scrolling
- **React Select**: For advanced dropdown capabilities
- **CSS Modules**: For component-scoped styling
- **Jest & React Testing Library**: For comprehensive testing

## 📊 Data Structure

The application works with two datasets:

1. **Small Dataset** 
   - Columns: number, mod3, mod4, mod5, mod6
   - Used for initial development and testing

2. **Large Dataset**
   - Columns: number, mod350, mod8000, mod20002
   - Used for performance testing with larger modulo values

## 🛠️ Implementation Details

### Filter Interaction Logic

When a user selects values in column A (e.g., mod3):
1. The table is filtered to show only rows where mod3 matches the selected values
2. For each other column (e.g., mod4, mod5):
   - We calculate which values in that column co-occur with the selected values in mod3
   - Only these co-occurring values are shown as available in the dropdown
   - Values that don't co-occur are shown but disabled
3. This ensures all filter dropdowns always reflect the current state of filtered data

### Performance Considerations

- **Efficient Data Structures**: Uses Sets for O(1) lookups instead of array includes()
- **Optimized Rendering**: Virtual list renders only visible rows (20 at a time)
- **Memoization**: Prevents recalculations of derived data
- **Typed Data**: TypeScript ensures type safety and prevents runtime errors

## 🧪 Testing

The project includes comprehensive unit tests for all critical components:

- **DataTable.test.tsx**: Tests table rendering, pagination, and scrolling
- **FilterDropdown.test.tsx**: Tests dropdown functionality and selection handling
- **useFilter.test.ts**: Tests filter logic and interaction behavior
- **csvParser.test.ts**: Tests data parsing utilities

Run tests with:
```
npm test
```

For coverage report:
```
npm test -- --coverage
```

## 🚀 Getting Started

### Prerequisites
- Node.js 14 or higher
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/business-intelligence-dashboard.git
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open your browser to http://localhost:3000

## 📝 Project Structure

```
src/
├── components/            # React components
│   ├── Dashboard/         # Main dashboard component
│   ├── DataTable/         # Table component with virtualization
│   ├── FilterDropdown/    # Filter dropdown component
│   ├── ErrorBoundary/     # Error handling component
│   └── LoadingSpinner/    # Loading indicator component
├── context/               # React Context for state management
│   └── DataContext.tsx    # Global data context
├── hooks/                 # Custom React hooks
│   └── useFilter.ts       # Filter logic hook
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared types
├── utils/                 # Utility functions
│   └── csvParser.ts       # CSV parsing utility
└── tests/                 # Test files
```

## 🔍 Code Quality Metrics

- **TypeScript Coverage**: 100% typed codebase with no 'any' types
- **Test Coverage**: >80% coverage across all critical components
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Performance**: Optimized for datasets with thousands of rows
- **Accessibility**: ARIA attributes and keyboard navigation support
