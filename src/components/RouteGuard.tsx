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

function isAdminRole(role: string | undefined): boolean {
  return role === 'admin' || role === 'superadmin';
}

function isAuthenticated() {
  return !!localStorage.getItem('ainexus_auth_token') && !!getUser();
}

export default function RouteGuard({ children, requireAuth = false, requireAdmin = false }: RouteGuardProps) {
  const location = useLocation();
  const user = getUser();
  const auth = isAuthenticated();
  const userIsAdmin = isAdminRole(user?.role);

  // Admin login page: redirect to admin overview if already admin
  if (location.pathname === '/admin-login') {
    if (auth && userIsAdmin) {
      return <Navigate to="/admin/overview" replace />;
    }
    return <>{children}</>;
  }

  // Regular login page: redirect to console if already logged in
  if (location.pathname === '/login' || location.pathname === '/register') {
    if (auth && !userIsAdmin) {
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
  if (requireAdmin && !userIsAdmin) {
    return <Navigate to="/console/overview" replace />;
  }

  // Non-admin trying to access admin routes
  if (location.pathname.startsWith('/admin') && !userIsAdmin) {
    return <Navigate to="/console/overview" replace />;
  }

  return <>{children}</>;
}
