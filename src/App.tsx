import React from 'react';
import { DataProvider } from './context/DataContext';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import './App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <DataProvider>
        <Dashboard />
      </DataProvider>
    </ErrorBoundary>
  );
};

export default App; 