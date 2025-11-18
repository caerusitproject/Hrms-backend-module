// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { AuthApi } from '../api/authApi'; // Use AuthApi as per previous fix
import { EmployeeAPI } from '../api/employeeApi';
import { storeAuthData } from '../pages/auth/authStorage';
import { setCookie } from '../utils/cookiesUtil';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const authResponse = await EmployeeAPI.login({ email, password });

      if (typeof storeAuthData === "function") {
        storeAuthData(authResponse);
      }

      const { userData } = authResponse;
      const userDataFormatted = {
        id: userData.id,
        email: userData.email,
        role: userData.authorities?.[0] || "USER",
        roles: userData.authorities || [],
        loginTime: new Date().toISOString(),
      };

      setIsAuthenticated(true);
      setUser(userDataFormatted);

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userDataFormatted));

      (async () => {
        try {
          const employeeData = await EmployeeAPI.fetchEmployeeData(userData.id);
          const updatedUser = {
            ...userDataFormatted,
            name: employeeData?.name,
            empCode: employeeData?.empCode,
            departmentId: employeeData?.departmentId,
            designation: employeeData?.designation,
            mobile: employeeData?.mobile,
            phone: employeeData?.phone,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.warn("Could not fetch employee details after login:", err.message);
        }
      })();

      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data?.message);
      setError(error.response?.data?.message || error.message || 'Login failed (Invalid email or password) ');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    //localStorage.clear();
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');

    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Updated context value to include setters
  const value = {
    isAuthenticated,
    setIsAuthenticated, // Add this
    user,
    setUser, // Add this
    login,
    logout,
    loading,
    setLoading, // Add this (optional, if needed elsewhere)
    error,
    setError, // Add this
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};