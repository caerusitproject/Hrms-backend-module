import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { theme } from "../../theme/theme";
import { ForgotPasswordAPI } from "../../api/forgotpasswordApi";
import CompanyLogo from "../../assets/caerus-logo.png";
import { COMPANY_INFO } from "../../utils/constants";

const ResetPassword = () => {
    const { token } = useParams(); // assuming route: /reset-password/:token
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return "Password must be at least 8 characters long";
        }
        if (!hasUpperCase) {
            return "Password must contain at least one uppercase letter";
        }
        if (!hasLowerCase) {
            return "Password must contain at least one lowercase letter";
        }
        if (!hasNumber) {
            return "Password must contain at least one number";
        }
        if (!hasSpecialChar) {
            return "Password must contain at least one special character";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!password || !confirmPassword) {
            setErrorMessage("Please fill in all fields");
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setErrorMessage(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const data = await ForgotPasswordAPI.resetPassword(token, {
                password: password,
                confirmPassword: confirmPassword
            });
            setSuccessMessage(data.message || "Password reset successful!");
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/login"), 3000);
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
                        Reset Your Password
                    </p>
                </div>

                {!successMessage ? (
                    <form onSubmit={handleSubmit}>
                        {/* New Password */}
                        <div style={{ marginBottom: "15px", textAlign: "left" }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: theme.colors.text.primary,
                                    fontWeight: "500",
                                }}
                            >
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
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

                        {/* Confirm Password */}
                        <div style={{ marginBottom: "15px", textAlign: "left" }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: theme.colors.text.primary,
                                    fontWeight: "500",
                                }}
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
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

                        {/* Error */}
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
                            {loading ? "Resetting..." : "Reset Password"}
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
                            Password Reset Successful!
                        </h3>
                        <p
                            style={{
                                color: theme.colors.text.secondary,
                                marginBottom: "20px",
                                fontSize: isMobile ? "13px" : "15px",
                            }}
                        >
                            You can now log in using your new password.
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
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;

