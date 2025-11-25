import config from "../config/config";
import axios from 'axios';
import { getCookie } from "../utils/cookiesUtil";

const LOCAL_API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';


export const ForgotPasswordAPI = {
    async forgotPassword(body) {
        try {
            const response = await axios.post(`${LOCAL_API}/auth/forgot-password`, body, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data; // { success: true, message: "Password reset email sent successfully!" }
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                "Failed to send password reset email. Please try again."
            );
        }

    },
    async resetPassword(token, body) {
        try {
            const response = await axios.post(`${LOCAL_API}/auth/reset-password/${token}`, body, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data; // { success: true, message: "Password reset successful!" }
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                "Failed to reset password. Please try again."
            );
        }
    },
};
