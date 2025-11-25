import config from "../config/config";
import axios from 'axios';import { getCookie } from "../utils/cookiesUtil";

const LOCAL_API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// ✅ Always get latest token for Authorization header
const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const BroadcastAPI = {
  // ✅ Create a new broadcast
  async create(body) {
    try {
      const response = await axios.post(`${LOCAL_API}/broadcast/create`, body, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create broadcast");
    }
  },

  // ✅ Update a broadcast by ID
  async update(id, body) {
    try {
      const response = await axios.put(`${LOCAL_API}/broadcast/update/${id}`, body, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update broadcast");
    }
  },

  // ✅ Get all broadcasts with optional filter
  // Example: /broadcast/all or /broadcast/all/today
  async getAll(filter) {
    try {
      const url = filter ? `${LOCAL_API}/broadcast/all/${filter}` : `${LOCAL_API}/broadcast/all`;
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch broadcasts");
    }
  },

  // ✅ Get single broadcast details
  async fetchBroadcast(id) {
    try {
      const response = await axios.get(`${LOCAL_API}/broadcast/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch broadcast");
    }
  },
};
