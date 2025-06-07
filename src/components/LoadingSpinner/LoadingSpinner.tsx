import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...'
}) => {
  return (
    <div className="loading-spinner-container" data-testid="loading-spinner-container">
      <div className={`loading-spinner loading-spinner-${size}`} data-testid="loading-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {message && <p className="loading-message" data-testid="loading-message">{message}</p>}
    </div>
  );
}; 