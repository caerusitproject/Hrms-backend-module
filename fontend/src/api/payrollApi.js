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
export const PayrollApi = {
  async getallPayroll() {
    try {
      const response = await axios.get(`${LOCAL_API}/compensations`, {
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
  async getpayrollById(id) {
    try {
      const response = await axios.get(`${LOCAL_API}/compensations/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching subordinates:", error.response?.data || error.message);
      throw error;
    }
  },
  async craetepayroll(payload) {
    try {
      const response = await axios.post(`${LOCAL_API}/compensations`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning manager:", error.response?.data || error.message);
      throw error;
    }
  },



  async getAllEmployees() {
    try {
      // simulate API delay
      const response = await axios.get(`${LOCAL_API}/payrolls/employee-list`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employees (mock):", error.message);
      return {
        success: false,
        message: "Failed to fetch employees (mock)",
      };
    }
  },


  async generatePayroll() {
    try {
      const now = new Date();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const response = await axios.post(`${LOCAL_API}/payrolls/finalizepay`, { monthyear: `${month}-${year}` }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error generating payroll:", error.response?.data || error.message);
      return {
        sucess: false,
        message: "Failed to generate payroll",
      }
    }
  },



};
