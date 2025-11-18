// src/pages/about/About.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../theme/theme';
import { COMPANY_INFO } from '../../utils/constants';

const About = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '⏰',
      title: 'Real-time Attendance Tracking',
      description: 'Track employee attendance with real-time updates and automated reporting.'
    },
    {
      icon: '📋',
      title: 'Leave Management System',
      description: 'Comprehensive leave management with approval workflows and balance tracking.'
    },
    {
      icon: '💰',
      title: 'Payroll Information Access',
      description: 'Secure access to payroll information, payslips, and salary details.'
    },
    {
      icon: '📢',
      title: 'Company Communications',
      description: 'Stay updated with company announcements, policies, and important notices.'
    },
    {
      icon: '👤',
      title: 'Employee Profile Management',
      description: 'Manage personal information, contact details, and professional data.'
    },
    {
      icon: '📊',
      title: 'Performance Analytics',
      description: 'Detailed analytics and reports on attendance, performance, and productivity.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '500+' },
    { label: 'Companies', value: '50+' },
    { label: 'Countries', value: '15+' },
    { label: 'Uptime', value: '99.9%' }
  ];

  return (
    <div className="fade-in" style={{ 
      padding: `${theme.spacing.xl} ${theme.spacing.lg}`,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: theme.spacing.xxl
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: theme.spacing.md
        }}>
          {COMPANY_INFO.logo}
        </div>
        <h1 style={{ 
          color: theme.colors.primary, 
          marginBottom: theme.spacing.md,
          fontSize: '48px',
          fontWeight: 'bold'
        }}>
          {COMPANY_INFO.name}
        </h1>
        <h2 style={{
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.lg,
          fontSize: '28px',
          fontWeight: '300'
        }}>
          {COMPANY_INFO.description}
        </h2>
        <p style={{ 
          color: theme.colors.text.secondary, 
          fontSize: '18px',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Streamline your HR operations with our comprehensive employee management platform 
          designed for modern businesses.
        </p>
      </div>

      {/* Stats Section */}
      <div className="card" style={{
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
        textAlign: 'center'
      }}>
        <h3 style={{
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.lg,
          fontSize: '24px'
        }}>
          Trusted by Organizations Worldwide
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: theme.spacing.lg
        }}>
          {stats.map((stat, index) => (
            <div key={index}>
              <div style={{
                color: theme.colors.primary,
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: theme.spacing.xs
              }}>
                {stat.value}
              </div>
              <div style={{
                color: theme.colors.text.secondary,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ marginBottom: theme.spacing.xl }}>
        <h3 style={{
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: theme.spacing.xl,
          fontSize: '32px',
          fontWeight: '600'
        }}>
          Platform Features
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: theme.spacing.lg
        }}>
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card"
              style={{
                padding: theme.spacing.xl,
                textAlign: 'center',
                transition: theme.transitions.medium
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = theme.shadows.large;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows.small;
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: theme.spacing.md
              }}>
                {feature.icon}
              </div>
              <h4 style={{
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.sm,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {feature.title}
              </h4>
              <p style={{
                color: theme.colors.text.secondary,
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section - Hidden for EMPLOYEE role */}
      {user?.role && user.role !== 'USER' && (
        <div className="card" style={{
          padding: theme.spacing.xl,
          textAlign: 'center',
          backgroundColor: `${theme.colors.primary}10`
        }}>
          <h3 style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
            fontSize: '24px'
          }}>
            Need Support?
          </h3>
          <p style={{
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.lg,
            fontSize: '16px'
          }}>
            Our team is here to help you get the most out of your employee management system.
          </p>
          <button className="btn-primary" style={{
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Contact Support
          </button>
        </div>
      )}
    </div>
  );
};

export default About;