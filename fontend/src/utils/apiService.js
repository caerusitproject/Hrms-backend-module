// import axios from 'axios';
// import { getAccessToken, getRefreshToken, updateAccessToken, updateRefreshToken, clearAuthData } from '../pages/auth/authStorage';
// import { AuthApi } from '../api/authApi';

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
  
//   failedQueue = [];
// };

// const apiService = axios.create();

// apiService.interceptors.request.use(
//   (config) => {
//     const token = getAccessToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// apiService.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(token => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return apiService(originalRequest);
//           })
//           .catch(err => {
//             return Promise.reject(err);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       const refreshToken = getRefreshToken();

//       if (!refreshToken) {
//         clearAuthData();
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       try {
//         const response = await AuthApi.refreshAccessToken(refreshToken);
        
//         updateAccessToken(response.accessToken);
//         if (response.refreshToken) {
//           updateRefreshToken(response.refreshToken);
//         }

//         apiService.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
//         originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

//         processQueue(null, response.accessToken);
        
//         isRefreshing = false;

//         return apiService(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         clearAuthData();
//         window.location.href = '/login';
//         isRefreshing = false;
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiService;