/**
 * Component tests for RoleGuard
 *
 * Verifies that:
 *  - Users with an allowed role can see guarded content.
 *  - Users with an insufficient role are redirected to the fallback path.
 *  - The default fallback path is "/".
 *  - A custom fallback path is respected.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleGuard from '../../components/RoleGuard';
import * as AuthContextModule from '../../context/AuthContext';
import type { AuthUser } from '../../types/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser(role: string): AuthUser {
  return { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role };
}

function renderGuard(
  user: AuthUser | null,
  allowedRoles: string[],
  fallback?: string
) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user,
    isAuthenticated: !!user,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/guarded']}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/forbidden" element={<div>Forbidden Page</div>} />
        <Route
          path="/guarded"
          element={
            <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
              <div>Admin Content</div>
            </RoleGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RoleGuard', () => {
  it('renders children when the user has an allowed role', () => {
    renderGuard(makeUser('admin'), ['admin', 'user']);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects to "/" by default when the user role is not allowed', () => {
    renderGuard(makeUser('viewer'), ['admin']);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects to a custom fallback path when specified', () => {
    renderGuard(makeUser('viewer'), ['admin'], '/forbidden');
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });

  it('redirects when user is null', () => {
    renderGuard(null, ['admin']);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('allows access for "user" role when included in allowedRoles', () => {
    renderGuard(makeUser('user'), ['admin', 'user']);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('denies access for "viewer" role when only "admin" is allowed', () => {
    renderGuard(makeUser('viewer'), ['admin']);
    expect(screen.queryByText('Admin Content')).toBeNull();
  });
});
