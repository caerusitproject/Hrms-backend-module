import { useEffect } from 'react';
import { getAccessToken, getRefreshToken, updateAccessToken, updateRefreshToken, clearAuthData, isAccessTokenExpired } from '../pages/auth/authStorage';
import { AuthApi } from '../api/authApi'; // Fixed from EmployeeAPI
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';
export const useTokenRefresh = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setUser, setError } = useAuth();

  useEffect(() => {
    const publicPaths = ['/login', '/forgot-password', '/reset-password'];
    const isPublic = publicPaths.some(path => location.pathname.startsWith(path));

    if (isPublic) return; // 👈 Skip refresh logic for public routes

    const checkAndRefreshToken = async () => {
      if (isAccessTokenExpired()) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const response = await AuthApi.refreshAccessToken(refreshToken);
            updateAccessToken(response.accessToken);
            if (response.refreshToken) {
              updateRefreshToken(response.refreshToken);
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            clearAuthData();
            setIsAuthenticated(false);
            setUser(null);
            setError('Session expired. Please log in again.');
            navigate('/login', { replace: true });
          }
        } else {
          clearAuthData();
          setIsAuthenticated(false);
          setUser(null);
          setError('Session expired. Please log in again.');
          navigate('/login', { replace: true });
        }
      }
    };

    const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000);
    checkAndRefreshToken();

    return () => clearInterval(interval);
  }, [navigate, setIsAuthenticated, setUser, setError, location.pathname]);
};
