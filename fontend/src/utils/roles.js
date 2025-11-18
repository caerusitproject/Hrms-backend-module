
export const ROLE_IDS = {
  EMPLOYEE: Number(process.env.REACT_APP_ROLE_EMPLOYEE), // 4
  MANAGER : Number(process.env.REACT_APP_ROLE_MANAGER),  // 3
  HR      : Number(process.env.REACT_APP_ROLE_HR),       // 2
  ADMIN   : Number(process.env.REACT_APP_ROLE_ADMIN),    // 1
};

// for the dropdown – value = id, label = human name
export const ROLE_OPTIONS = [
  { value: "",               label: "Select Role" },
  { value: ROLE_IDS.ADMIN,   label: "Admin" },
  { value: ROLE_IDS.HR,      label: "HR" },
  { value: ROLE_IDS.MANAGER, label: "Manager" },
  { value: ROLE_IDS.EMPLOYEE,label: "Employee" },   // <-- renamed
];