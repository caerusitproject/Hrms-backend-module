import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme/theme';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      textAlign: 'center',
      padding: theme.spacing.lg
    }}>
      {/* 404 Illustration */}
      <div style={{ marginBottom: theme.spacing.xl }}>
        <div style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: theme.colors.primary,
          margin: 0,
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          animation: 'bounce 2s infinite'
        }}>
          404
        </div>
      </div>

      {/* Error Content */}
      <div style={{ maxWidth: '500px', marginBottom: theme.spacing.xl }}>
        <h1 style={{ 
          fontSize: '32px', 
          color: theme.colors.text.primary, 
          marginBottom: theme.spacing.md,
          fontWeight: '600'
        }}>
          Page Not Found
        </h1>
        
        <p style={{ 
          fontSize: '18px',
          color: theme.colors.text.secondary, 
          marginBottom: theme.spacing.lg,
          lineHeight: '1.6'
        }}>
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: theme.spacing.md,
          alignItems: 'center'
        }}>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              minWidth: '200px'
            }}
          >
            Go to Login
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
            style={{
              padding: '12px 24px',
              fontSize: '14px'
            }}
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Helpful Links */}
      <div style={{
        backgroundColor: theme.colors.white,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.medium,
        boxShadow: theme.shadows.small,
        maxWidth: '400px',
        width: '100%'
      }}>
        <h3 style={{
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md,
          fontSize: '18px'
        }}>
          Need Help?
        </h3>
        <p style={{
          color: theme.colors.text.secondary,
          fontSize: '14px',
          margin: 0,
          lineHeight: '1.5'
        }}>
          If you believe this is an error, please contact your system administrator
          or try refreshing the page.
        </p>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;