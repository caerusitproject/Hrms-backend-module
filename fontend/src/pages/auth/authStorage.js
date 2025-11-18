import { setCookie, getCookie } from '../../utils/cookiesUtil';

// Cookie names constants
const COOKIE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  USER_NAME: 'userName',
  USER_ROLES: 'userRoles',
  LOGIN_TIME: 'loginTime'
};

// Token expiry days
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 1,      // 1 day
  REFRESH_TOKEN: 7,     // 7 days
  USER_DATA: 7          // 7 days
};

/**
 * Store authentication data in cookies after successful login
 * @param {Object} authResponse - The response from login API
 * @param {string} authResponse.accessToken - JWT access token
 * @param {string} authResponse.refreshToken - JWT refresh token
 * @param {Object} authResponse.userData - User information
 * @returns {boolean} - Success status
 */
export const storeAuthData = (authResponse) => {
  try {
    const { accessToken, refreshToken, userData } = authResponse;

    if (!accessToken || !refreshToken || !userData) {
      console.error('storeAuthData: Missing required authentication data');
      return false;
    }

    // Store tokens
    setCookie(COOKIE_KEYS.ACCESS_TOKEN, accessToken, TOKEN_EXPIRY.ACCESS_TOKEN);
    setCookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, TOKEN_EXPIRY.REFRESH_TOKEN);

    // Store user data
    setCookie(COOKIE_KEYS.USER_ID, userData.id, TOKEN_EXPIRY.USER_DATA);
    setCookie(COOKIE_KEYS.USER_EMAIL, userData.email, TOKEN_EXPIRY.USER_DATA);
    //setCookie(COOKIE_KEYS.USER_NAME, userData.username, TOKEN_EXPIRY.USER_DATA);
    
    // Store roles as JSON string (authorities array)
    const roles = Array.isArray(userData.authorities) 
      ? userData.authorities.join(',') 
      : userData.authorities || '';
    setCookie(COOKIE_KEYS.USER_ROLES, roles, TOKEN_EXPIRY.USER_DATA);
    
    // Store login timestamp
    setCookie(COOKIE_KEYS.LOGIN_TIME, new Date().toISOString(), TOKEN_EXPIRY.USER_DATA);

    console.log('Auth data stored successfully');
    return true;
  } catch (error) {
    console.error('storeAuthData: Failed to store auth data:', error);
    return false;
  }
};

/**
 * Retrieve access token from cookies
 * @returns {string|null} - Access token or null
 */
export const getAccessToken = () => {
  return getCookie(COOKIE_KEYS.ACCESS_TOKEN);
};

/**
 * Retrieve refresh token from cookies
 * @returns {string|null} - Refresh token or null
 */
export const getRefreshToken = () => {
  return getCookie(COOKIE_KEYS.REFRESH_TOKEN);
};

/**
 * Retrieve all user data from cookies
 * @returns {Object|null} - User data object or null
 */
export const getUserData = () => {
  try {
    const id = getCookie(COOKIE_KEYS.USER_ID);
    const email = getCookie(COOKIE_KEYS.USER_EMAIL);
    const username = getCookie(COOKIE_KEYS.USER_NAME);
    const rolesString = getCookie(COOKIE_KEYS.USER_ROLES);
    const loginTime = getCookie(COOKIE_KEYS.LOGIN_TIME);

    if (!id || !email) {
      return null;
    }

    return {
      id: parseInt(id, 10),
      email,
      username: username || email.split('@')[0],
      roles: rolesString ? rolesString.split(',') : [],
      loginTime
    };
  } catch (error) {
    console.error('getUserData: Failed to retrieve user data:', error);
    return null;
  }
};

/**
 * Update only the access token (after refresh)
 * @param {string} newAccessToken - New access token
 * @returns {boolean} - Success status
 */
export const updateAccessToken = (newAccessToken) => {
  try {
    if (!newAccessToken) {
      console.error('updateAccessToken: Invalid token provided');
      return false;
    }
    return setCookie(COOKIE_KEYS.ACCESS_TOKEN, newAccessToken, TOKEN_EXPIRY.ACCESS_TOKEN);
  } catch (error) {
    console.error('updateAccessToken: Failed to update access token:', error);
    return false;
  }
};

/**
 * Update only the refresh token
 * @param {string} newRefreshToken - New refresh token
 * @returns {boolean} - Success status
 */
export const updateRefreshToken = (newRefreshToken) => {
  try {
    if (!newRefreshToken) {
      console.error('updateRefreshToken: Invalid token provided');
      return false;
    }
    return setCookie(COOKIE_KEYS.REFRESH_TOKEN, newRefreshToken, TOKEN_EXPIRY.REFRESH_TOKEN);
  } catch (error) {
    console.error('updateRefreshToken: Failed to update refresh token:', error);
    return false;
  }
};

/**
 * Clear all authentication data from cookies (logout)
 * @returns {boolean} - Success status
 */
export const clearAuthData = () => {
  try {
    Object.values(COOKIE_KEYS).forEach(key => {
      setCookie(key, '', -1); // Set expiry to past date to delete
    });
    console.log('Auth data cleared successfully');
    return true;
  } catch (error) {
    console.error('clearAuthData: Failed to clear auth data:', error);
    return false;
  }
};

/**
 * Check if user is authenticated (has valid tokens)
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const userData = getUserData();
  return !!(accessToken && userData);
};

/**
 * Get user role(s)
 * @returns {Array<string>} - Array of user roles
 */
export const getUserRoles = () => {
  const userData = getUserData();
  return userData ? userData.roles : [];
};

/**
 * Check if user has a specific role
 * @param {string} role - Role to check
 * @returns {boolean} - Whether user has the role
 */
export const hasRole = (role) => {
  const roles = getUserRoles();
  return roles.includes(role);
};

/**
 * Check if user has any of the specified roles
 * @param {Array<string>} requiredRoles - Array of roles to check
 * @returns {boolean} - Whether user has any of the roles
 */
export const hasAnyRole = (requiredRoles) => {
  const userRoles = getUserRoles();
  return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Get complete auth state for Redux or Context
 * @returns {Object} - Complete auth state
 */
export const getAuthState = () => {
  return {
    isAuthenticated: isAuthenticated(),
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    user: getUserData()
  };
};

/**
 * Check if access token is expired (optional - for manual checking)
 * @returns {boolean}
 */
export const isAccessTokenExpired = () => {
  const token = getAccessToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiry;
  } catch (error) {
    return true;
  }
};

export default {
  storeAuthData,
  getAccessToken,
  getRefreshToken,
  getUserData,
  updateAccessToken,
  updateRefreshToken,
  clearAuthData,
  isAuthenticated,
  getUserRoles,
  hasRole,
  hasAnyRole,
  getAuthState,isAccessTokenExpired,
};