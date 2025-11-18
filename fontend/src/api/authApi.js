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
export const AuthApi = {
  async login(body) {
    try {
      const response = await axios.post(`${LOCAL_API}/auth/login`, body);
      return response.data; // axios returns data in response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'iLogin failed (Invalid email or password)');
    }
  },

  async refreshAccessToken(refrestoken) {
    try {
      console.log("Refreshing access token with refresh, refreshToken:", refrestoken);
      const refreshToken ={  refreshToken : refrestoken}
      const response = await axios.post(`${LOCAL_API}/auth/refresh`, refreshToken, {
         headers: getAuthHeaders(),
      });
      return response.data; // Should return { accessToken, refreshToken }
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

};