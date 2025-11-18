import CompanyLogo from '../components/CompanyLogo';

export const ROUTES = {
  LOGIN: '/login',
  HOME: '/home',
  ABOUT: '/about',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ATTENDANCE: '/attendance',
  LEAVE: '/leave',
  PAYROLL: '/payroll'
};

export const MENU_ITEMS = [
  {
    path: ROUTES.HOME,
    label: 'Home',
    icon: '🏠',
    key: 'home'
  },
  {
    path: ROUTES.ABOUT,
    label: 'About',
    icon: 'ℹ️',
    key: 'about'
  },
  {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: '📊',
    key: 'dashboard'
  }
];

export const COMPANY_INFO = {
  name: 'Caerus It Consulting',
  logo: CompanyLogo,
  description: 'Employee Management System',
  version: '1.0.0'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'isAuthenticated',
  USER_DATA: 'user',
  CURRENT_PATH: 'currentPath',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  THEME_PREFERENCE: 'themePreference'
};

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  USER_PROFILE: '/api/user/profile',
  ATTENDANCE: '/api/attendance',
  LEAVE: '/api/leave',
  DASHBOARD: '/api/dashboard'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day'
};

export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PERSONAL: 'personal',
  EMERGENCY: 'emergency'
};