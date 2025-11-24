
import axios from 'axios'; import { getCookie } from "../utils/cookiesUtil";
const LOCAL_API = process.env.BACKEND_API || 'http://localhost:3000/api';

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
  async leaveList() {
    try {
      const response = await axios.get(`${LOCAL_API}/leave/list`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching subordinates:", error.response?.data || error.message);
      throw error;
    }
  },


  async leaveStatus(id, status) {
  try {
   const response = await axios.patch(
  `${LOCAL_API}/leave`,
  {}, 
  {
    headers: getAuthHeaders(),
    params: { id, status },
  }
);

    return response.data;
  } catch (error) {
    console.error(
      "Error updating leave status:",
      error.response?.data || error.message
    );
    throw error;
  }
}

};