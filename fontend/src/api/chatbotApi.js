// src/api/ChatApi.js
import axios from "../utils/axiosInterceptor";
import { getCookie } from "../utils/cookiesUtil";
const LOCAL_API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const ChatApi = {
  async sendMessage(message) {
    try {
      const response = await axios.post(
        `${LOCAL_API}/ai/chat`,
        { query: message }, // ✅ send the user's question
        { headers: getAuthHeaders() } // ✅ pass headers correctly
      );
      return response.data; // expecting something like { answer: "..." }
    } catch (error) {
      console.error(
        "Error chatting with AI:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
