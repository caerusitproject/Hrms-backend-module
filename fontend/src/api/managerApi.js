
import axios from 'axios'; import { getCookie } from "../utils/cookiesUtil";
const LOCAL_API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = getCookie("accessToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};
export const ManagerAPI = {
    async getTeam(managerId) {
    try {
      const response = await axios.get(`${LOCAL_API}/manager/team`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching subordinates:", error.response?.data || error.message);
      throw error;
    }
  },
};