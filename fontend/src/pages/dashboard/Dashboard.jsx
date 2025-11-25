// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import CompanyLogo from "../../assets/caerus-logo.png";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { EmployeeAPI } from "../../api/employeeApi";
import { DashboardAPI } from "../../api/dashboardApi";
import { theme } from "../../theme/theme";
import Button from "../../components/common/Button";
import CustomLoader from "../../components/common/CustomLoader";
const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || "USER"; // default to USER if undefined

  const navigate = useNavigate();

  // Team Activity Feed Data - now dynamic for HR/MANAGER/ADMIN
  const [teamFeed, setTeamFeed] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!role) return;
      setLoading(true);
      try {
        const data = await DashboardAPI.getDashboardData(role);
        setDashboardData(data);

        // Set teamFeed based on role
        if (role === "MANAGER") {
          setTeamFeed(
            data.teamMembers.map((emp) => ({
              id: emp.id,
              name: emp.name,
              email: emp.email,
              avatar: emp.name.charAt(0).toUpperCase(),
            }))
          );
        } else if (role === "HR" || role === "ADMIN") {
          setTeamFeed(
            data.allEmployeesDetails.map((emp) => ({
              id: emp.id,
              name: emp.name,
              email: emp.email,
              avatar: emp.name.charAt(0).toUpperCase(),
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role, user?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        <CustomLoader />
      </div>
    );
  }

  // Quick Overview Data - dynamic
  let quickOverview = [];

  if (role === "USER" && dashboardData) {
    quickOverview = [
      {
        label: "Pending Leave Requests",
        value: (dashboardData?.pendingLeaveCount ?? 0).toString(),
        color: theme.colors.warning,
      },
      {
        label: "Attendance This Month",
        value: "20",
        color: theme.colors.success,
      },
    ];
  } else if (role === "MANAGER" && dashboardData) {
    quickOverview = [
      {
        label: "Active Team Members",
        value: (dashboardData?.totalTeamMembers ?? 0).toString(),
        color: theme.colors.success,
      },
      {
        label: "Pending Approvals",
        value: (dashboardData?.pendingLeaves?.length ?? 0).toString(),
        color: theme.colors.warning,
      },
      {
        label: "Attendance This Month",
        value: "20",
        color: theme.colors.success,
      },
      {
        label: "Pending Leave Requests",
        value: "2",
        color: theme.colors.warning,
      },
    ];
  } else if ((role === "HR" || role === "ADMIN") && dashboardData) {
    quickOverview = [
      {
        label: "Total Employees",
        value: (dashboardData?.totalEmployees ?? 0).toString(),
        color: theme.colors.primary,
      },
      {
        label: "Documents Shared",
        value: "35",
        color: theme.colors.primaryLight,
      },
      {
        label: "Attendance This Month",
        value: "20",
        color: theme.colors.success,
      },
      {
        label: "Pending Leave Requests",
        value: "2",
        color: theme.colors.warning,
      },
    ];
  }

  // Upcoming Events Data - from broadcasts
  let upcomingEvents = [];

  if (dashboardData) {
    const todayBroadcasts = dashboardData.upcomingBroadcasts || [];

    if (todayBroadcasts.length > 0) {
      upcomingEvents = todayBroadcasts.map((b) => ({
        id: b.id,
        title: b.title,
        date: new Date(b.createdAt).toDateString(),
        color: theme.colors.primary,
      }));
    } else {
      // When no broadcasts are found
      upcomingEvents = [
        {
          id: "no-events",
          title: dashboardData?.upcomingBroadcasts?.message || "No events found",
          date: "",
          color: theme.colors.secondary || "#999", // optional fallback color
        },
      ];
    }
  }

  return (
    <div>
      {/* Header */}
      {/* Main Dashboard Content */}
      <h1
        style={{
          fontSize: window.innerWidth < 640 ? "24px" : "32px",
          fontWeight: 700,
          color: theme.colors.text.primary,
          margin: 0,
          flex: 1, // allows heading to shrink if needed
        }}
      >
        Dashboard
      </h1>

      <Card
        sx={{
          mt: 3,
          p: { xs: 2, sm: 3 },
          mb: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 3,
          textAlign: { xs: "center", sm: "left" }, // Center text on mobile
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: {
              xs: "center", // center content on mobile
              sm: "space-between", // side-by-side on larger screens
            },
            flexDirection: {
              xs: "column", // stack vertically on mobile
              sm: "row", // horizontal layout for tablets/desktops
            },
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* Left Section - Text & Buttons */}
          <Box sx={{ flex: 1, minWidth: "260px" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: "20px", md: "24px" },
              }}
            >
              Quick Access
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                fontSize: { xs: "13px", md: "14px" },
              }}
            >
              Manage your personal information, job details, and more.
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                justifyContent: { xs: "center", sm: "flex-start" },
                flexWrap: "wrap",
                overflow: "auto",
              }}
            >
              {role === "ADMIN" || role === "HR" ? (
                <Button
                  type="secondary"
                  variant="filled"
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: 1.2,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: { xs: "13px", md: "14px" },
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => navigate("/employee/create")}
                >
                  + Add Employee
                </Button>
              ) : (
                <Button
                  type="secondary"
                  variant="filled"
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: 1.2,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: { xs: "13px", md: "14px" },
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => navigate("/employee-profile/" + user?.id)}
                >
                  View Profile
                </Button>
              )}

              <Button
                type="white"
                variant="outlined"
                sx={{
                  px: { xs: 2, md: 3 },
                  py: 1.2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: { xs: "13px", md: "14px" },
                  whiteSpace: "nowrap",
                }}
                onClick={() => navigate("/attendance")}
              >
                View Attendance
              </Button>
            </Box>
          </Box>

          {/* Right Section - Company Logo */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={CompanyLogo}
              alt="Company Logo"
              style={{
                height: "auto",
                width: "100%",
                maxWidth: "200px",
                objectFit: "contain",
              }}
            />
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {/* Team Activity Feed */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Quick Overview */}
            <Card sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Quick Overview
              </Typography>
              <Grid container spacing={2}>
                {quickOverview.map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: item.color,
                          mb: 1,
                        }}
                      >
                        {item.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "12px" }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>

            {/* Upcoming Events */}
            <Card sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Todays Events
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {upcomingEvents.map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* ✅ Only show the calendar icon if this is a real event */}
                    {event.id !== "no-events" && (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: "#FFF4F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            fontSize: "20px",
                            color: event.color,
                          }}
                        >
                          📅
                        </Box>
                      </Box>
                    )}
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          lineHeight: 1.4,
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "13px" }}
                      >
                        {event.date}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        </Grid>
        {role !== "USER" && (
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                {role === "MANAGER" ? "My Team" : "All Employees"} Overview
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {teamFeed.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      p: 2,
                      bgcolor: "background.paper",
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.colors.primary,
                        width: 40,
                        height: 40,
                        fontSize: "18px",
                        fontWeight: 600,
                      }}
                    >
                      {activity.avatar}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {activity.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.email}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {teamFeed.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No team data available.
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        )}

        {/* Right Column - Quick Overview & Upcoming Events */}
      </Grid>
    </div>
  );
};

export default Dashboard;