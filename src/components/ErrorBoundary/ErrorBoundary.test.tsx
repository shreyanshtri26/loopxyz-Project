import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Helper component that throws an error when the shouldThrow prop is true
const ErrorThrowingComponent: React.FC<{ shouldThrow?: boolean, errorMessage?: string }> = ({ 
  shouldThrow = false,
  errorMessage = 'Test error message'
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Normal component rendering</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: jest.fn() }
    });
  });
  
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test child component</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test child component')).toBeInTheDocument();
  });
  
  test('renders error UI when a child component throws', () => {
    // Using a spy on console.error instead of a full mock to capture all parameters
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check error UI elements
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error details')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    
    // Check that console.error was called with the error
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
  
  test('displays specific error message', () => {
    const specificErrorMessage = 'This is a specific error message';
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} errorMessage={specificErrorMessage} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(specificErrorMessage)).toBeInTheDocument();
  });
  
  test('clicking "Try again" button reloads the page', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Click the "Try again" button
    fireEvent.click(screen.getByText('Try again'));
    
    // Check that window.location.reload was called
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
  
  test('error details can be toggled by clicking summary', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Get the summary element
    const summary = screen.getByText('Error details');
    
    // Check that details are initially closed
    const details = summary.parentElement;
    expect(details).not.toHaveAttribute('open');
    
    // Click to open details
    fireEvent.click(summary);
    
    // Check that details are now open
    expect(details).toHaveAttribute('open');
  });
  
  test('componentDidCatch logs the error and error info', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // console.error should be called with 'Uncaught error:' followed by the error object
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Uncaught error:',
      expect.any(Error),
      expect.any(Object)
    );
    
    consoleErrorSpy.mockRestore();
  });
  
  test('resets error state before reloading', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Error UI should be shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click try again button
    fireEvent.click(screen.getByText('Try again'));
    
    // Manually trigger a rerender with a non-throwing component to simulate
    // the state reset (since we can't easily test the full reload)
    rerender(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Should now show normal component
    expect(screen.getByText('Normal component rendering')).toBeInTheDocument();
  });
}); 