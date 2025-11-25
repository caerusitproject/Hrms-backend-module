import axios from "axios";
import { getCookie } from "../utils/cookiesUtil";

const LOCAL_API = process.env.BACKEND_API || "http://localhost:3000/api";
const FILE_URL = process.env.IMAGE_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const HandbookAPI = {
  // -----------------------------
  // Upload / Create Handbook
  // -----------------------------
  async uploadHandbook(title, file, updatedBy) {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      formData.append("updatedBy", updatedBy);

      const url = `${LOCAL_API}/handbooks`; // POST API

      const response = await axios.post(url, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error uploading handbook:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // -----------------------------
  // Update Handbook by ID
  // -----------------------------
  async updateHandbook(id, title, file, updatedBy) {
    try {
      const formData = new FormData();
      if (title) formData.append("title", title);
      if (file) formData.append("file", file);
      formData.append("updatedBy", updatedBy);

      const url = `${LOCAL_API}/handbooks/${id}`; // PUT API

      const response = await axios.put(url, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error updating handbook:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // -----------------------------
  // Get All Handbooks
  // -----------------------------
  async getAllHandbooks() {
    try {
      const url = `${LOCAL_API}/handbooks`; // GET API
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching handbooks:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // -----------------------------
  // Get Single Handbook by ID
  // -----------------------------
  async getHandbookById(id) {
    try {
      const url = `${LOCAL_API}/handbooks/${id}`;
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching handbook:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // -----------------------------
  // Delete Handbook by ID
  // -----------------------------
  async deleteHandbook(id) {
    try {
      const url = `${LOCAL_API}/handbooks/${id}`;
      const response = await axios.delete(url, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting handbook:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // -----------------------------
  // Generate public URL for handbook file
  // -----------------------------
 getFileURL(fileName) {
    if (!fileName) return "";
    
    // Extract just the filename from full path (handles both \ and /)
    const fileNameOnly = fileName.split('\\').pop().split('/').pop();
    
    // Build correct public URL
    // console.log("Generated file URL for:", fileNameOnly);
    // console.log("Full URL:", `${FILE_URL}/${fileNameOnly}`);
    return `${FILE_URL}/${fileNameOnly}`;
  },
};
