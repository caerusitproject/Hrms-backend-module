import axios from 'axios';
import { getAccessToken, getRefreshToken, updateAccessToken, updateRefreshToken, clearAuthData } from '../pages/auth/authStorage';
import { AuthApi } from '../api/authApi';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add access token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token, logout
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh token API
        const response = await AuthApi.refreshAccessToken(refreshToken);
         console.log("file hooks")
        // Update tokens in cookies
        updateAccessToken(response.accessToken);
        if (response.refreshToken) {
          updateRefreshToken(response.refreshToken);
        }

        // Update axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

        // Process queued requests
        processQueue(null, response.accessToken);
        
        isRefreshing = false;

        // Retry original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        processQueue(refreshError, null);
        clearAuthData();
        window.location.href = '/login';
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;