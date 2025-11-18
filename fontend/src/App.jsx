
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReduxProvider from './components/ReduxProvider';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './components/AppRoutes';
import './App.css';

const App = () => {
  
  return (
    <ReduxProvider>
      <BrowserRouter basename="/app">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ReduxProvider>
  );
};

export default App;


