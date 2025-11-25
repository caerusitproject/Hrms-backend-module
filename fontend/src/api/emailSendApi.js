import axios from 'axios';
import { getCookie } from "../utils/cookiesUtil";

const LOCAL_API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// ✅ Always get latest token for Authorization header
const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ✅ Employee API object
export const EmailSendApi = {
  async sendEmail(data) {
    try {
      const response = await axios.post(`${LOCAL_API}/email/send`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching employees by role:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
