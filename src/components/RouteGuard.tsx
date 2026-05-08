import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

function getUser() {
  try {
    const raw = localStorage.getItem('ainexus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return !!localStorage.getItem('ainexus_auth_token') && !!getUser();
}

export default function RouteGuard({ children, requireAuth = false, requireAdmin = false }: RouteGuardProps) {
  const location = useLocation();
  const user = getUser();
  const auth = isAuthenticated();

  // Admin login page: redirect to admin overview if already admin
  if (location.pathname === '/admin-login') {
    if (auth && user?.role === 'superadmin') {
      return <Navigate to="/admin/overview" replace />;
    }
    return <>{children}</>;
  }

  // Regular login page: redirect to console if already logged in
  if (location.pathname === '/login' || location.pathname === '/register') {
    if (auth && user?.role !== 'superadmin') {
      return <Navigate to="/console/overview" replace />;
    }
    return <>{children}</>;
  }

  // Require auth
  if (requireAuth && !auth) {
    const isAdminRoute = location.pathname.startsWith('/admin');
    return <Navigate to={isAdminRoute ? '/admin-login' : '/login'} replace />;
  }

  // Require admin role
  if (requireAdmin && user?.role !== 'superadmin') {
    return <Navigate to="/console/overview" replace />;
  }

  // Non-admin trying to access admin routes
  if (location.pathname.startsWith('/admin') && user?.role !== 'superadmin') {
    return <Navigate to="/console/overview" replace />;
  }

  return <>{children}</>;
}
