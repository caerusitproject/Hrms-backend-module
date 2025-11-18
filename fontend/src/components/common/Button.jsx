import React from "react";
import { theme } from "../../theme/theme";

const Button = ({
  type = "primary",
  disabled = false,
  onClick,
  children,
  size = "medium", // small | medium | large
  fullWidth = false,
}) => {
  const sizes = {
    small: {
      padding: "6px 12px",
      fontSize: "13px",
    },
    medium: {
      padding: "10px 18px",
      fontSize: "14px",
    },
    large: {
      padding: "12px 24px",
      fontSize: "16px",
    },
  };

  const baseStyle = {
    borderRadius: "8px",
    fontWeight: 600,
    fontFamily:
      theme.typography?.fontFamily || '"Inter", "Roboto", "Arial", sans-serif',
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.25s ease",
    whiteSpace: "nowrap",
    display: "inline-block",
    width: fullWidth ? "100%" : "auto",
    opacity: disabled ? 0.7 : 1,
    border: "none",
    ...sizes[size],
  };

  const variants = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: "#fff",
      border: "none",
    },
    secondary: {
      backgroundColor: "transparent",
      color: theme.colors.primary,
      border: `2px solid ${theme.colors.primary}`,
    },
    tertiary: {
      backgroundColor: "transparent",
      color: theme.colors.text.secondary,
      border: `2px solid ${theme.colors.text.secondary}`,
    },
    white: {
      backgroundColor: "#fff",
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.text.secondary}`,
    },
    error: {
      backgroundColor: theme.colors.error,
      color: "#fff",
    },
    success: {
      backgroundColor: theme.colors.success,
      color: "#fff",
    },
  };

  const hoverStyles = {
    primary: {
      backgroundColor: theme.colors.primaryDark || "#0056b3",
    },
    secondary: {
      backgroundColor: theme.colors.primary + "15",
    },
    tertiary: {
      backgroundColor: theme.colors.text.secondary + "20",
    },
    white: {
      backgroundColor: "#f3f3f3",
    },
    error: {
      backgroundColor: theme.colors.errorDark || "#c0392b",
    },
    success: {
      backgroundColor: theme.colors.successDark || "#27ae60",
    },
  };

  const style = {
    ...baseStyle,
    ...variants[type],
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={style}
      onMouseEnter={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, hoverStyles[type]);
      }}
      onMouseLeave={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, variants[type]);
      }}
    >
      {children}
    </button>
  );
};

export default Button
