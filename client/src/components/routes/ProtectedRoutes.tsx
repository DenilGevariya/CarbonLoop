import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, onboardingRequired } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (onboardingRequired && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, onboardingRequired } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    if (onboardingRequired) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

interface RoleRouteProps {
  allowedRoles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, activeOrg } = useAuth();

  const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
  const orgType = activeOrg?.orgType?.toLowerCase() || '';

  const isPlatformAdmin = userRoles.includes('platform_admin') || userRoles.includes('admin');

  if (isPlatformAdmin) {
    return <Outlet />;
  }

  const hasRoleMatch = allowedRoles.some(
    (role) => userRoles.includes(role.toLowerCase()) || orgType.includes(role.toLowerCase())
  );

  if (!hasRoleMatch) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
