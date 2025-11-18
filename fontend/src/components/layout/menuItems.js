// menuItems.js
import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventAvailableIcon from "@mui/icons-material/EventAvailable"; // Attendance
import BeachAccessIcon from "@mui/icons-material/BeachAccess"; // Leave management
import CampaignIcon from "@mui/icons-material/Campaign"; // Broadcast
import ConfigIcon from "@mui/icons-material/Settings"; // Admin Config
import GroupIcon from "@mui/icons-material/Group";
import { Payment } from "@mui/icons-material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id || 1; // fallback to 1 if not found
export const menuItems = [
  {
    path: "/home",
    label: "Home",
    icon: HomeIcon,
    key: "home",
    requiredRoles: ["USER", "MANAGER", "HR", "ADMIN"],
  },
  {
    path: `/employee-profile/${userId}`,
    label: "Profile",
    icon: PersonIcon,
    key: "profile",
    requiredRoles: ["USER", "MANAGER", "HR", "ADMIN"],
  },
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
    key: "dashboard",
    requiredRoles: ["MANAGER", "HR", "ADMIN", "USER"],
  },
  {
    path: "/attendance",
    label: "Attendance",
    icon: EventAvailableIcon,
    key: "attendance",
    requiredRoles: ["USER", "MANAGER", "HR", "ADMIN"],
  },
  {
    path: "/leave-management",
    label: "Leave Management",
    icon: BeachAccessIcon,
    key: "leave-management",
    requiredRoles: ["USER", "MANAGER", "HR", "ADMIN"],
  },
  {
    path: "/employees-list",
    label: "Employee List",
    icon: GroupIcon,
    key: "employee-list",
    requiredRoles: ["HR", "ADMIN"],
  },
  {
    path: "/my-team",
    label: "My Team",
    icon: GroupIcon,
    key: "my-team",
    requiredRoles: ["MANAGER"],
  },
  {
    path: "/payroll",
    label: "Payroll",
    icon: Payment,
    key: "payroll",
    requiredRoles: ["ADMIN"],
  },
  {
    path: "/email-process",
    label: "Email Process",
    icon: SendOutlinedIcon,
    key: "email-process",
    requiredRoles: ["HR", "ADMIN"], // optional, if HR can view
  },
  {
    path: "/broadcast",
    label: "Broadcast",
    icon: CampaignIcon,
    key: "broadcast",
    requiredRoles: ["USER", "MANAGER", "HR", "ADMIN"],
  },
  {
    path: "/email-templetes",
    label: "Email Templates",
    icon: EmailOutlinedIcon,
    key: "email-templates",
    requiredRoles: ["ADMIN"], // optional, if HR can view
  },
  
  {
    path: "/admin-config",
    label: "Admin Config",
    icon: ConfigIcon,
    key: "admin-config",
    requiredRoles: ["ADMIN"],
  },
  // {
  //   path: "/about",
  //   label: "About",
  //   icon: InfoIcon,
  //   key: "about",
  //   requiredRoles: ["USER", "MANAGER", "HR", "ADMIN"],
  // },
];
