import axios from "axios";
import { getCookie } from "../utils/cookiesUtil";
const LOCAL_API = process.env.REACT_APP_API_URL || "http://localhost:3000/api";
const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
export const ConfigApi = {
  async get(empCode, month, year) {
    const response = await fetch(
      `${LOCAL_API}/attendance/record/${empCode}/${month}/${year}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  },

  async getAllUsers() {
    const response = await fetch(`${LOCAL_API}/admin/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  },
  async createUser(payload) {
    try {
      const response = await axios.post(
        `${LOCAL_API}/auth/register`,
        payload,
        {}
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error assigning manager:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async updateUserEmail(payload) {
    try {
      const response = await axios.patch(`${LOCAL_API}/admin/users`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error assigning manager:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async getAllDepartments() {
    try {
      const response = await axios.get(`${LOCAL_API}/departments`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching departments:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async createDepartment(payload) {
    try {
      const response = await axios.post(`${LOCAL_API}/departments`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error assigning manager:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async updateDepartment(id, payload) {
    try {
      const response = await axios.patch(
        `${LOCAL_API}/departments/${id}`,
        payload,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error assigning manager:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  //Holidays

  async getAllHolidays() {
    try {
      const response = await axios.get(`${LOCAL_API}/admin/holiday`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching holidays:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  async createHoliday(payload) {
    try {
      const response = await axios.post(`${LOCAL_API}/admin/holiday`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error creating holiday:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  async updateHoliday(payload) {
    console.log(payload);
    try {
      
      const response = await axios.patch(
        `${LOCAL_API}/admin/holiday`,
        payload,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error updating holiday:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  async deleteHoliday(id) {
    try {
      const response = await axios.delete(`${LOCAL_API}/admin/holiday/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting holiday:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
