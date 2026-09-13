import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRoleHomePath, hasCarbonRole, resolveCarbonRole } from '@/lib/roles';

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
  children?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, activeOrg } = useAuth();
  const hasRoleMatch = hasCarbonRole(allowedRoles, user?.roles, activeOrg?.orgType);

  if (!hasRoleMatch) {
    return <Navigate to={getRoleHomePath(resolveCarbonRole(user?.roles, activeOrg?.orgType))} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
