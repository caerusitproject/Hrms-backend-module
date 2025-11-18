import React, { useState } from "react";
import { theme } from "../../theme/theme"; // Adjust path based on your project structure
// Import Material UI icons for password toggle (ensure @mui/icons-material is installed)
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Input = ({ 
  label, 
  name, 
  type = "text", 
  register, 
  required = false, 
  rules = {}, 
  errors, 
  disabled = false,
  options = [], // For select type: [{value: '', label: 'Select...'}]
  showPassword = false, // For password type: external state
  onTogglePassword, // For password type: toggle handler
  placeholder = "",
  labelColor = theme.colors.text.secondary,
  inputColor = theme.colors.text.primary,
  defaultBorderColor = theme.colors.mediumGray,
  activeBorderColor = theme.colors.primary,
  errorBorderColor = theme.colors.error,
  backgroundColor = "#ffffff",
  borderWidth = "0.8px",
  activeBorderWidth = "2px",
  className = "",
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const error = errors?.[name.split('.')[0]]?.[name.split('.')[1]] || errors?.[name];

  const validationRules = {
    ...(required && { required: `${label} is required` }),
    ...rules
  };

  const commonInputStyle = {
    width: "100%",
    padding: theme.spacing.sm,
    border: error
  ? `${activeBorderWidth} solid ${errorBorderColor}`
  : `${isFocused ? activeBorderWidth : borderWidth} solid ${isFocused ? activeBorderColor : defaultBorderColor}`,
    outline: "none",
    borderRadius: theme.borderRadius.small,
    fontSize: "16px",
    color: disabled ? theme.colors.text.secondary : inputColor,
    backgroundColor: disabled ? "#fff" : backgroundColor, // Consistent white bg for disabled
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
    cursor: disabled ? "not-allowed" : "text",
    opacity: disabled ? 0.7 : 1, // Subtle disabled look
  };

  const handleFocus = () => !disabled && setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <select
            {...register(name, validationRules)}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              ...commonInputStyle,
              paddingRight: theme.spacing.sm, // Consistent padding
            }}
            {...rest}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "password":
        return (
          <div style={{ position: "relative" }}>
            <input
              {...register(name, validationRules)}
              type={showPassword ? "text" : "password"}
              disabled={disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{
                ...commonInputStyle,
                paddingRight: "40px", // Space for eye icon
              }}
              {...rest}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              disabled={disabled}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                color: disabled ? theme.colors.text.secondary : theme.colors.text.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </button>
          </div>
        );
      default: // text, email, date, tel, etc.
        return (
          <input
            type={type}
            {...register(name, validationRules)}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={commonInputStyle}
            placeholder={placeholder}
            {...rest}
          />
        );
    }
  };

  return (
    <div style={{ marginBottom: theme.spacing.md, maxWidth: "100%" }} className={className}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: disabled ? theme.colors.text.secondary : labelColor,
            marginBottom: theme.spacing.xs,
          }}
        >
          {label} {required && <span style={{ color: theme.colors.error }}>*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p style={{ color: theme.colors.error, fontSize: "12px", marginTop: theme.spacing.xs }}>
          {error.message || error}
        </p>
      )}
    </div>
  );
};

export default Input;