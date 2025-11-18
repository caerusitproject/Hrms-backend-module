// Footer.jsx
import React from "react";
import { theme } from "../../theme/theme";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: theme.colors.white,
        borderTop: `1px solid ${theme.colors.lightGray}`,
        borderRadius: "15px",
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        marginTop: "auto",
        marginBottom: "10px",
        marginLeft: `${theme.spacing.md}`,
        marginRight: `${theme.spacing.md}`,
        textAlign: "center",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
        }}
      >
        {/* Left side - Copyright */}
        <div
          style={{
            color: theme.colors.primaryLight,
            fontSize: "12px",
          }}
        >
          © {currentYear} Caerus. All rights reserved.
        </div>

        {/* Center - Company Info */}
        <div
          style={{
            color: theme.colors.text.primary,
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          Employee Management System
        </div>

        {/* Right side - Version/Links */}
        <div
          style={{
            display: "flex",
            gap: theme.spacing.xs,
            alignItems: "center",
            flexDirection: "column", // default desktop
          }}
          className="footer-right"
        >
          <span
            style={{
              color: theme.colors.primaryLight,
              fontSize: "11px",
            }}
          >
            v1.0.0
          </span>
          <a
            href="/privacy"
            style={{
              color: theme.colors.primaryLight,
              fontSize: "11px",
              textDecoration: "none",
              transition: theme.transitions.fast,
            }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            style={{
              color: theme.colors.primaryLight,
              fontSize: "11px",
              textDecoration: "none",
              transition: theme.transitions.fast,
            }}
          >
            Terms of Service
          </a>
        </div>

        <style>
          {`
    @media (max-width: 768px) {
      .footer-right {
        flex-direction: row !important;
        justify-content: center;
        gap: auto !important;
        width: 100%;
      }
    }
  `}
        </style>
      </div>

      {/* Mobile responsive layout */}
      <style>
        {`
          @media (max-width: 768px) {
            footer > div {
              flex-direction: column;
              text-align: center;
              gap: ${theme.spacing.xs};
            }
            footer > div > div:last-child {
              justify-content: center;
              gap: 4px;
            }
            footer > div > div {
              font-size: 11px;
            }
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
