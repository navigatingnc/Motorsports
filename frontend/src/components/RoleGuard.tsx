import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: string;
}

/**
 * Wraps a route so that only users with one of the specified roles can access it.
 * Users with insufficient roles are redirected to the fallback path (default: /).
 * Must be used inside a ProtectedRoute (i.e., user is already authenticated).
 */
const RoleGuard = ({ children, allowedRoles, fallback = '/' }: RoleGuardProps) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
