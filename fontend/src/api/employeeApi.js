import config from "../config/config";
import axios from 'axios';
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

export const EmployeeAPI = {
  // ✅ LOGIN (no header required)
  async login(body) {
    try {
      const response = await axios.post(`${LOCAL_API}/employees/login`, body, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Get single employee details
  async fetchEmployeeData(employeeId) {
    try {
      const response = await axios.get(`${LOCAL_API}/employees/${employeeId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee data:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Create new employee
  async createEmployee(employeeData) {
    try {
      const response = await axios.post(`${LOCAL_API}/employees/create`, employeeData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating employee:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Get all employees
  // EmployeeAPI.js
  async getAllEmployees(page = 1, limit = 7) {
    try {
      const response = await axios.get(`${LOCAL_API}/employees/all`, {
        headers: getAuthHeaders(),
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Get all managers
  async getAllManagers() {
    try {
      const response = await axios.get(`${LOCAL_API}/employees/managers`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching managers:", error.response?.message || error.message);
      throw error;
    }
  },

  // ✅ Get manager by ID
  async getManagerById(id) {
    try {
      const response = await axios.get(`${LOCAL_API}/employees/managers/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching manager by ID:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Get subordinates of a manager
  async getallSubordinates() {
    try {
      const response = await axios.get(`${LOCAL_API}/employees/manager`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching subordinates:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Assign manager (ADMIN only)
  async assignManager(payload) {
    try {
      const response = await axios.patch(`${LOCAL_API}/employees/assign-manager`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning manager:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Update employee details (HR, ADMIN)
  async updateEmployee(id, employeeData) {
    try {
      const response = await axios.put(`${LOCAL_API}/employees/edit/${id}`, employeeData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error updating employee:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Example: External HIP service
  async getUserDetailById(id) {
    try {
      const response = await axios.get(`${LOCAL_API}/auth/user-detail-id`, {
        headers: getAuthHeaders(),
        params: { id },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching HIP user detail:", error.response?.data || error.message);
      throw error;
    }
  },

  async getDepartments() {
    try {
      const response = await axios.get(`${LOCAL_API}/departments`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching HIP user detail:", error.response?.data || error.message);
      throw error;
    }
  },
  async getManagerById(id) {
    try {
      const response = await axios.get(`${LOCAL_API}/employees/manager/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching manager by ID:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Get subordinates of a specific manager (HR, ADMIN)
  async getSubordinates(managerId) {
    try {
      const response = await axios.get(`${LOCAL_API}/employees/managers/subordinate/${managerId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching subordinates:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Assign manager (ADMIN, HR)
  async assignManager(payload) {
    try {
      const response = await axios.patch(`${LOCAL_API}/employees/assign/manager`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning manager:", error.response?.data || error.message);
      throw error;
    }
  },
};
