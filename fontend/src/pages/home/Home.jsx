"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useAuth } from "../../hooks/useAuth"
import { theme } from "../../theme/theme"
import { useNavigate } from "react-router-dom"
import CompanyLogo from "../../assets/caerus-logo.png"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";


const Home = () => {
  const { user, isAuthenticated } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const reduxAuthState = useSelector((state) => state.auth)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [hoveredButton, setHoveredButton] = useState(null)
  const navigate = useNavigate()
  const role = user?.role || "USER"

 const quickActions = [
  {
    label: "View Profile",
     path: `/employee-profile/${user?.id}`,
    icon: <PersonOutlineIcon />,
    roles: ["ADMIN", "HR", "MANAGER", "USER"],
  },
  {
    label: "View Employees",
    path: "/employees-list",
    icon: <GroupOutlinedIcon />,
    roles: ["ADMIN", "HR"],
  },
  {
    label: "Send Email",
    path: "/email-process",
    icon: <MailOutlineIcon />,
    roles: ["ADMIN", "HR"],
  },
  {
    label: "My Team",
    path: "/my-team",
    icon: <Groups2OutlinedIcon />,
    roles: ["MANAGER"],
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlinedIcon />,
    roles: ["ADMIN", "HR", "MANAGER", "USER"],
    featured: true,
  },
];


  const visibleActions = quickActions.filter((action) => action.roles.includes(user?.role))

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    console.log("Context API State (useAuth):", { isAuthenticated, user })
    console.log("Redux Auth State:", reduxAuthState)
  }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: theme.spacing.xxl }}>
        <img
          src={CompanyLogo || "/placeholder.svg"}
          alt="Company Logo"
          style={{
            height: isMobile ? "85px" : "140px",
            width: "auto",
            maxWidth: "240px",
            marginBottom: theme.spacing.lg,
            objectFit: "contain",
          }}
        />

        <h1
          style={{
            color: theme.colors.text.primary,
            fontSize: isMobile ? "28px" : "48px",
            fontWeight: "800",
            marginBottom: theme.spacing.sm,
          }}
        >
          Welcome to HRMS, {user?.name}! 👋
        </h1>
        <p
          style={{
            color: theme.colors.text.secondary,
            fontSize: isMobile ? "14px" : "18px",
            maxWidth: isMobile ? "100%" : "600px",
            margin: "0 auto",
          }}
        >
          Stay connected and manage your work efficiently. Access tools, information, and updates to stay productive and
          aligned with your team.
        </p>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.large,
          padding: isMobile ? theme.spacing.xl : "40px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${theme.colors.border}`,
          paddingBottom: isMobile ? theme.spacing.xxl : "100px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing.xl,
          }}
        >
          <div>
            <h2
              style={{
                color: theme.colors.text.primary,
                fontSize: isMobile ? "24px" : "28px",
                fontWeight: "700",
                margin: 0,
                marginBottom: theme.spacing.xs,
              }}
            >
              Quick Actions
            </h2>
            <p
              style={{
                color: theme.colors.text.secondary,
                fontSize: "14px",
                margin: 0,
              }}
            >
              Navigate to your most-used features
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
            gap: theme.spacing.lg,
          }}
        >
          {visibleActions.map((action, index) => (
            <button
              key={index}
              onMouseEnter={() => setHoveredButton(index)}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => navigate(action.path)}
              style={{
                background: action.featured
                  ? `${theme.colors.primaryLight}34`
                  : hoveredButton === index
                    ? theme.colors.gray
                    : theme.colors.surface,
                border:  action.featured 
                    ? `2px solid ${
                  hoveredButton === index
                    ? theme.colors.primaryDark
                    : theme.colors.primary
                }` :`2px solid ${
                  hoveredButton === index
                    ? theme.colors.primary
                    :  "transparent"
                }`,
                borderRadius: theme.borderRadius.large,
                padding: theme.spacing.xl,
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: hoveredButton === index ? "translateY(-4px)" : "translateY(0)",
                boxShadow:
                  hoveredButton === index
                    ? "0 12px 30px rgba(0, 0, 0, 0.12)"
                    : "0 2px 8px rgba(0, 0, 0, 0.25)",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.md,
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  color: theme.colors.primaryDark,
                }}
              >
                {action.icon}
              </div>
              <div>
                <div
                  style={{
                    color: action.featured ? theme.colors.primaryDark : theme.colors.text.primary,
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "600",
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {action.label}
                </div>
                <div
                  style={{
                    color: action.featured ? theme.colors.primaryDark : theme.colors.primaryDark,
                    fontSize: "13px",
                  }}
                >
                  {action.featured ? "Access your analytics" : "Quick access"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
