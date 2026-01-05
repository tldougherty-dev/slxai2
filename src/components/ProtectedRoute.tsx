import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser, getUserRole } from '@/lib/auth';
import { canAccessAdmin } from '@/lib/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        setIsAuth(authenticated);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error checking authentication:', error);
        }
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (!isAuth) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement if needed
  if (requireAdmin) {
    const role = getUserRole();
    const canAccess = canAccessAdmin(role);
    
    if (!canAccess) {
      if (process.env.NODE_ENV === 'development') {
        const currentUser = getCurrentUser();
        console.warn('Access denied: User cannot access admin', {
          user: currentUser?.email,
          role: role,
        });
      }
      return <Navigate to="/membership-portal/feed" replace />;
    }
  }

  return <>{children}</>;
}

