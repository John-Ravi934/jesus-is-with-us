import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/admin/Login';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../services/authService');
vi.mock('react-hot-toast');

describe('Login Component Security & Resilience Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders login form with necessary inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('admin@jesusiswithus.org')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /secure login/i })).toBeInTheDocument();
  });

  it('disables the submit button while authenticating', async () => {
    // Mock a slow promise to keep loading state true
    authService.adminLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('admin@jesusiswithus.org');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /secure login/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);
    
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/authenticating/i);
    
    // Wait for the mock to resolve
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
  });

  it('displays error toast when server returns account locked error', async () => {
    // The server enforces the limit, so the client just displays the message
    authService.adminLogin.mockRejectedValue(new Error('Account locked. Try again after 10:00:00 AM'));
    
    renderLogin();
    
    fireEvent.change(screen.getByPlaceholderText('admin@jesusiswithus.org'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /secure login/i }));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Account locked. Try again after'));
    });
  });
});
