import axios from "axios";
import { getCookie } from "../utils/cookiesUtil";

const LOCAL_API = process.env.REACT_APP_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const UploadAPI = {
  // -----------------------------
  // Upload Profile Image
  // -----------------------------
  async uploadProfile(empId, file) {
    try {
      const formData = new FormData();
      formData.append("profile", file);

      const url = `${LOCAL_API}/upload/${empId}/profile`;

      const response = await axios.post(url, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error uploading profile image:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // -----------------------------
  // Get Profile Image Metadata
  // -----------------------------
  async getProfileImage(empId) {
    try {
      const url = `${LOCAL_API}/upload/${empId}/image`;

      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching profile image:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // -----------------------------
  // Create URL for Image File
  // -----------------------------


  getFileURL(fileName) {
    if (!fileName) return "";
    
    // Extract just the filename from full path (handles both \ and /)
    const fileNameOnly = fileName.split('\\').pop().split('/').pop();
    
    // Build correct public URL
    console.log("Generated file URL for:", fileNameOnly);
    console.log("Full URL:", `${LOCAL_API}/uploads/${fileNameOnly}`);
    return `${LOCAL_API}/uploads/${fileNameOnly}`;
  },

//  getFileURL(fileName) {
//     // If backend returns full path like "D:\\Workspace\\...\\1763705494056.png"
//     // Extract only the filename
//     if (!fileName) return "";
    
//     const justFileName = fileName.split('\\').pop().split('/').pop();
//     console.log("Generated just file URL for:", justFileName);
//     return `${fileName}`;
//   },
// `${LOCAL_API}/uploads/${fileName}`;
};
