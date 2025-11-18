import axios from 'axios';
import { getCookie } from "../utils/cookiesUtil";
const LOCAL_API = process.env.BACKEND_API || 'http://localhost:3000/api';


const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
export const DashboardAPI = {
  async getDashboardData(role) {
    try {
      // Determine endpoint based on role
      let endpoint = "";
      switch (role?.toUpperCase()) {
        case "USER":
          endpoint = "employee";
          break;
        case "MANAGER":
          endpoint = "manager";
          break;
        case "HR":
        case "ADMIN":
          endpoint = "hr";
          break;
        default:
          throw new Error("Invalid role provided");
      }

      // Build full API URL
      let url = `${LOCAL_API}/dashboard/${endpoint}`

      // API Call
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  },
};
