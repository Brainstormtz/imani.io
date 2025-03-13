import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/auth.store';
import type { UserRole } from '../utils/supabase';

interface Props {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const navigate = useNavigate();
  const { user, profile, isLoading, initialize, demoMode } = useAuthStore();

  // Initialize auth system (including demo mode detection)


  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Skip auth check if we're in demo mode
    if (demoMode) {
      // In demo mode, we assume admin access to avoid any role restrictions
      // This is safe since it's only mock data and improves the testing experience
      console.log('Demo mode: bypassing role restrictions');
      return;
    }
    
    // Standard auth check
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    // Role check for authenticated users
    if (!isLoading && user && requiredRole && profile) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(profile.role as UserRole)) {
        navigate('/unauthorized');
      }
    }
  }, [user, profile, demoMode, isLoading, requiredRole, navigate]);

  // Show loading only if we're not in demo mode and still loading
  if (isLoading && !demoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
