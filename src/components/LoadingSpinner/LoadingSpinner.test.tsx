import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders without crashing', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  test('renders default size (medium) spinner', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('loading-spinner-medium');
  });
  
  test('renders small size spinner when specified', () => {
    render(<LoadingSpinner size="small" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('loading-spinner-small');
  });
  
  test('renders large size spinner when specified', () => {
    render(<LoadingSpinner size="large" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('loading-spinner-large');
  });
  
  test('renders default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  test('renders custom message when provided', () => {
    const customMessage = 'Custom loading message';
    render(<LoadingSpinner message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
  
  test('does not render message when empty string is provided', () => {
    render(<LoadingSpinner message="" />);
    
    const messageElements = screen.queryAllByTestId('loading-message');
    expect(messageElements.length).toBe(0);
  });
  
  test('renders with correct container class', () => {
    render(<LoadingSpinner />);
    
    const container = screen.getByTestId('loading-spinner-container');
    expect(container).toHaveClass('loading-spinner-container');
  });
  
  test('renders four divs inside spinner for animation', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    const divs = spinner.querySelectorAll('div');
    expect(divs.length).toBe(4);
  });
  
  test('spinner divs have no classes applied to them', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    const divs = spinner.querySelectorAll('div');
    
    divs.forEach(div => {
      expect(div.className).toBe('');
    });
  });
  
  test('has appropriate structure for accessibility', () => {
    render(<LoadingSpinner message="Loading content" />);
    
    const message = screen.getByTestId('loading-message');
    const spinner = screen.getByTestId('loading-spinner');
    
    expect(message.textContent).toBe('Loading content');
    expect(spinner.parentElement).toBe(screen.getByTestId('loading-spinner-container'));
    expect(message.parentElement).toBe(screen.getByTestId('loading-spinner-container'));
  });
}); 