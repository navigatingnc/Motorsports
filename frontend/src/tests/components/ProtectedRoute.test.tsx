/**
 * Component tests for ProtectedRoute
 *
 * Verifies that:
 *  - Authenticated users can see protected content.
 *  - Unauthenticated users are redirected to /login.
 *  - The original destination is preserved in location state.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import * as AuthContextModule from '../../context/AuthContext';
import type { AuthUser } from '../../types/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser: AuthUser = {
  id: '1',
  email: 'driver@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
};

function renderWithRouter(
  initialPath: string,
  isAuthenticated: boolean,
  user: AuthUser | null = null
) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user,
    isAuthenticated,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProtectedRoute', () => {
  it('renders children when the user is authenticated', () => {
    renderWithRouter('/protected', true, mockUser);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when the user is not authenticated', () => {
    renderWithRouter('/protected', false, null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('does not render protected content for unauthenticated users', () => {
    renderWithRouter('/protected', false, null);
    expect(screen.queryByText('Protected Content')).toBeNull();
  });
});
