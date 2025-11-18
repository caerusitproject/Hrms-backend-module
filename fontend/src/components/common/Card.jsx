import React from "react";
import { useTheme } from "../../theme/theme"; // adjust import if needed

const Card = ({ title, children, icon }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.sm,
      }}
    >
      {/* Card Header */}
      {title && (
        <h3
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            color: theme.colors.text.primary,
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      )}

      {/* Card Content */}
      <div style={{ color: theme.colors.text.secondary }}>{children}</div>
    </div>
  );
};

export default Card;
