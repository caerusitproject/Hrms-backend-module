import axios from "../utils/axiosInterceptor";
import { getCookie } from "../utils/cookiesUtil";

const LOCAL_API = process.env.BACKEND_API || 'http://localhost:3000/api';

// ✅ Always get latest token for Authorization header
const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ✅ Employee API object
export const AllemployeeApi = {
  async getEmployeesByRole() {
    try {
      const response = await axios.get(`${LOCAL_API}/employees/list`, {
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
