// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has a required role (if requiredRoles is specified)
  if (requiredRoles.length > 0 && (!user?.role || !requiredRoles.includes(user.role))) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;