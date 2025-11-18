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

// ✅ Email Template API object
export const EmailTemplateAPI = {
  // 🔹 Create a new email template
  async createTemplate(data) {
    try {
      const response = await axios.post(`${LOCAL_API}/email/create`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating template:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 Update an existing template by ID
  async updateTemplate(id, data) {
    try {
      const response = await axios.patch(`${LOCAL_API}/email/update?id=${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error updating template:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 Delete a template by ID
  async deleteTemplate(id) {
    try {
      const response = await axios.delete(`${LOCAL_API}/email/delete?id=${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting template:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 Get a template by type (HR or ADMIN)
  async getTemplateByType(type) {
    try {
      const response = await axios.get(`${LOCAL_API}/email/types?type=${type}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching template by type:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 Get all template types
  async getAllTemplateTypes() {
    try {
      const response = await axios.get(`${LOCAL_API}/email/all`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching template types:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 Get all templates list (paginated or full)
  async getAllTemplates() {
    try {
      const response = await axios.get(`${LOCAL_API}/email/all`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all templates:", error.response?.data || error.message);
      throw error;
    }
  },
};
