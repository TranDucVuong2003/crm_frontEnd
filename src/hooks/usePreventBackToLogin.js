import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export const usePreventBackToLogin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const preventBack = (e) => {
      // If user tries to go back and they're authenticated
      if (window.location.pathname === '/login') {
        e.preventDefault();
        navigate('/', { replace: true });
      }
    };

    // Listen for popstate event (browser back/forward)
    window.addEventListener('popstate', preventBack);

    // Also prevent going back to login when authenticated
    const handleBeforeUnload = () => {
      if (window.location.pathname === '/login' && isAuthenticated) {
        window.history.pushState(null, null, '/');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', preventBack);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, navigate]);
};