import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess } from "../../store/slices/authSlice";
import { useAuth } from "../../hooks/useAuth";
import { storeAuthData } from "./authStorage";
import { theme } from "../../theme/theme";
import { COMPANY_INFO } from "../../utils/constants";
import CompanyLogo from "../../assets/caerus-logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isAuthenticated, loading, error } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login(email, password);

    if (success) {
      navigate("/home", { replace: true });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.colors.gray} 0%, ${theme.colors.background} 100%)`,
        padding: isMobile ? "10px" : "20px",
        overflow: "auto",
      }}
    >
      <div
        className="fade-in"
        style={{
          backgroundColor: theme.colors.white,
          padding: isMobile ? "15px" : "30px",
          borderRadius: theme.borderRadius.large,
          boxShadow: theme.shadows.large,
          width: isMobile ? "90%" : "400px",
          maxWidth: "100%",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow = theme.shadows.xlarge;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = theme.shadows.large;
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: isMobile ? "15px" : "20px",
          }}
        >
          <img
            src={CompanyLogo}
            alt="Company Logo"
            style={{
              height: isMobile ? "40px" : "48px",
              width: isMobile ? "140px" : "200px",
              maxWidth: "100%",
              objectFit: "contain",
              marginBottom: "10px",
            }}
          />
          <h1
            style={{
              color: theme.colors.primary,
              margin: "0 0 5px 0",
              fontSize: isMobile ? "20px" : "22px",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            {COMPANY_INFO.name}
          </h1>
          <p
            style={{
              color: theme.colors.text.secondary,
              margin: "0",
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: "400",
              letterSpacing: "0.3px",
            }}
          >
            {COMPANY_INFO.description}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div
            style={{
              marginBottom: isMobile ? "10px" : "15px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: theme.colors.text.primary,
                fontWeight: "500",
                fontSize: isMobile ? "12px" : "14px",
                letterSpacing: "0.2px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field"
              placeholder="Enter your email"
              disabled={loading}
              required
              style={{
                width: "100%",
                padding: isMobile ? "10px" : "12px",
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.lightGray}`,
                fontSize: isMobile ? "14px" : "16px",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = theme.colors.primary)
              }
              onBlur={(e) =>
                (e.target.style.borderColor = theme.colors.lightGray)
              }
            />
          </div>

          {/* Password Input */}
          <div
            style={{
              marginBottom: isMobile ? "10px" : "15px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: theme.colors.text.primary,
                fontWeight: "500",
                fontSize: isMobile ? "12px" : "14px",
                letterSpacing: "0.2px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field"
              placeholder="Enter your password"
              disabled={loading}
              required
              style={{
                width: "100%",
                padding: isMobile ? "10px" : "12px",
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.lightGray}`,
                fontSize: isMobile ? "14px" : "16px",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = theme.colors.primary)
              }
              onBlur={(e) =>
                (e.target.style.borderColor = theme.colors.lightGray)
              }
            />
          </div>

          {error && (
            <div
              style={{
                color: theme.colors.error,
                marginBottom: isMobile ? "10px" : "15px",
                fontSize: isMobile ? "12px" : "14px",
                padding: "10px",
                backgroundColor: `${theme.colors.error}10`,
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.error}30`,
                letterSpacing: "0.2px",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              padding: isMobile ? "12px" : "14px",
              fontSize: isMobile ? "14px" : "16px",
              fontWeight: "600",
              background: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.primary}cc 100%)`,
              color: theme.colors.white,
              border: "none",
              borderRadius: theme.borderRadius.medium,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              letterSpacing: "0.5px",
              marginBottom: "10px",
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Forgot Password Button */}
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            disabled={loading}
            style={{
              width: "100%",
              padding: isMobile ? "10px" : "12px",
              fontSize: isMobile ? "14px" : "16px",
              fontWeight: "500",
              backgroundColor: "transparent",
              color: theme.colors.primary,
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              letterSpacing: "0.5px",
              marginTop: isMobile ? "0" : "5px",
            }}
          >
            Forgot Password?
          </button>
        </form>

        {/* Demo Info */}
        <div
          style={{
            marginTop: isMobile ? "15px" : "20px",
            padding: isMobile ? "8px" : "12px",
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.small,
            fontSize: isMobile ? "10px" : "12px",
            color: theme.colors.text.secondary,
            textAlign: "center",
            letterSpacing: "0.2px",
          }}
        >
          <strong>Login:</strong> Use organization email and password to login
        </div>
      </div>
    </div>
  );
};

export default Login;
