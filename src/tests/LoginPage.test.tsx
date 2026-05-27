import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage'; // Adjust path if needed
import { describe, expect, it, vi } from 'vitest';

// Mock the fetch/axios call
global.fetch = vi.fn();

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/parolă/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email sau parolă incorectă' }),
    });

    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/parolă/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email sau parolă incorectă/i)).toBeInTheDocument();
    });
  });
});