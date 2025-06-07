import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import { DataProvider } from './context/DataContext';
import './App.css';

const App: React.FC = () => {
  return (
    <DataProvider>
      <div className="app">
        <Dashboard />
      </div>
    </DataProvider>
  );
};

export default App; 