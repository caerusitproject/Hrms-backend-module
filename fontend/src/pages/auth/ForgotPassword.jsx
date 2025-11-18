import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../../theme/theme";
import { COMPANY_INFO } from "../../utils/constants";
import CompanyLogo from "../../assets/caerus-logo.png";
import { ForgotPasswordAPI } from "../../api/forgotpasswordApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const validateEmail = (email) => {
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const data = await ForgotPasswordAPI.forgotPassword({ email });
      setSuccessMessage(data.message || "Password reset link sent successfully!");
      setEmail("");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
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
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.white,
          padding: isMobile ? "20px" : "30px",
          borderRadius: theme.borderRadius.large,
          boxShadow: theme.shadows.large,
          width: isMobile ? "90%" : "400px",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <img
            src={CompanyLogo}
            alt="Company Logo"
            style={{
              height: isMobile ? "40px" : "48px",
              width: isMobile ? "140px" : "200px",
              marginBottom: "10px",
              objectFit: "contain",
            }}
          />
          <h1
            style={{
              color: theme.colors.primary,
              fontSize: isMobile ? "20px" : "22px",
              fontWeight: "700",
              marginBottom: "5px",
            }}
          >
            {COMPANY_INFO.name}
          </h1>
          <p
            style={{
              color: theme.colors.text.secondary,
              fontSize: isMobile ? "12px" : "14px",
              marginBottom: "10px",
            }}
          >
            Forgot your password?
          </p>
        </div>

        {/* Form or success message */}
        {!successMessage ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: theme.colors.text.primary,
                  fontWeight: "500",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={loading}
                required
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  borderRadius: theme.borderRadius.small,
                  border: `1px solid ${theme.colors.lightGray}`,
                  fontSize: isMobile ? "14px" : "16px",
                }}
              />
            </div>

            {errorMessage && (
              <div
                style={{
                  color: theme.colors.error,
                  backgroundColor: `${theme.colors.error}10`,
                  border: `1px solid ${theme.colors.error}30`,
                  padding: "10px",
                  borderRadius: theme.borderRadius.small,
                  marginBottom: "10px",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: theme.colors.primary,
                color: theme.colors.white,
                border: "none",
                borderRadius: theme.borderRadius.medium,
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: "10px",
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: theme.colors.primary,
                textDecoration: "underline",
                fontSize: isMobile ? "13px" : "15px",
                marginTop: "15px",
                cursor: "pointer",
              }}
            >
              ← Back to Login
            </button>
          </form>
        ) : (
          <div>
            <h3
              style={{
                color: theme.colors.primary,
                marginBottom: "10px",
                fontSize: isMobile ? "18px" : "20px",
              }}
            >
              Check Your Email!
            </h3>
            <p
              style={{
                color: theme.colors.text.secondary,
                marginBottom: "20px",
                fontSize: isMobile ? "13px" : "15px",
              }}
            >
              We’ve sent a password reset link to your email. Please check your inbox.
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "12px",
                background: theme.colors.primary,
                color: theme.colors.white,
                border: "none",
                borderRadius: theme.borderRadius.medium,
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
