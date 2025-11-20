// Updated Attendance.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Calendar from "../../components/common/Calendar";
import { theme } from "../../theme/theme";
import { AttendanceAPI } from "../../api/attendanceApi";
import { AllemployeeApi } from "../../api/getallemployeeApi";
import { Select, MenuItem, FormControl } from "@mui/material";
import CustomLoader from "../../components/common/CustomLoader";

const Attendance = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpCode, setSelectedEmpCode] = useState("");
  const [showDropdown, setShowDropdown] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const today = new Date();
  const role = user?.role || "USER";
  const canViewAll = ["MANAGER", "ADMIN", "HR"].includes(role);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [daysData, setDaysData]=useState({});

  // Default to current user's empCode
  useEffect(() => {
    if (user?.empCode) {
      setSelectedEmpCode(user.empCode);
    } else {
      setSelectedEmpCode("EMP001");
    }
  }, [user]);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch employees list if authorized
  useEffect(() => {
    if (canViewAll) {
      const fetchEmployees = async () => {
        try {
          setEmployeesLoading(true);
          const response = await AllemployeeApi.getEmployeesByRole();
          if (response.success) {
            setEmployees(response.data.employeeList || []);
            if (user?.id) {
              const currentEmp = response.data.employeeList.find(
                (emp) => emp.id === user.id.toString()
              );
              if (currentEmp) {
                setSelectedEmpCode(currentEmp.empCode);
              }
            }
          } else {
            throw new Error(response.message || "Failed to fetch employees");
          }
        } catch (err) {
          console.error("Error fetching employees:", err);
          setShowDropdown(false);
        } finally {
          setEmployeesLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [canViewAll, user]);

  // Fetch attendance data when month/year or selectedEmpCode changes
  useEffect(() => {
    if (!selectedEmpCode) return;
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const response = await AttendanceAPI.getAttendanceByEmployee(
          selectedEmpCode,
          month,
          year
        );
        if (response.success) {
          setAttendanceData(response.data.records);
          setDaysData(response.data.summary)
        } else {
          throw new Error(
            response.message || "Failed to fetch attendance data"
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [currentDate, selectedEmpCode]);

  // Calculate hours from checkIn and checkOut times
  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "Absent";
    const start = new Date(`1970-01-01T${checkIn}Z`);
    const end = new Date(`1970-01-01T${checkOut}Z`);
    const diffMs = end - start;
    if (diffMs <= 0) return "Absent";
    const hours = diffMs / (1000 * 60 * 60);
    return `${hours.toFixed(1)}hrs`;
  };

  // Transform API data for calendar
  const events = attendanceData.map((item) => ({
    date: item.date,
    type: item.status === "Absent" ? "Absent" : "Present",
    label:
      item.status === "Absent"
        ? "Absent"
        : calculateHours(item.checkIn, item.checkOut),
  }));

  // Totals
  // const totalHours = attendanceData
  //   .filter((a) => a.status !== "Absent")
  //   .reduce((sum, a) => {
  //     const hours = calculateHours(a.checkIn, a.checkOut);
  //     return sum + (hours !== "Absent" ? parseFloat(hours) : 0);
  //   }, 0);
  const totalHours = Number(daysData.totalHours) ||0;
  const absentDays = daysData.daysAbsent;
  const presentDays = daysData.daysPreent;

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const boxStyle = {
    textAlign: "center",
    fontSize: isMobile ? "12px" : "16px",
    fontWeight: 600,
  };

  const labelStyle = {
    fontSize: isMobile ? "9px" : "16px",
    opacity: 0.9,
    whiteSpace: "nowrap",
  };

  const headerCommonStyle = {
    width: "100%",
    marginBottom: "16px",
    backgroundColor: `${theme.colors.primaryLight}34`,
    borderRadius: "10px",
  };

  const summaryBoxesStyle = {
    display: "flex",
    gap: isMobile ? "20px" : "25px",
    justifyContent: "center",
    flexWrap: "nowrap",
  };

  const summariesContainerStyle = isMobile
    ? {
        width: "100%",
        display: "flex",
        gap: isMobile ? "20px" : "20px",
        justifyContent: "center",
        paddingBottom: "3px"
      }
    : summaryBoxesStyle;

  if (loading || employeesLoading) {
    return (
      <div>
        <CustomLoader />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1
        style={{
          fontSize: "25px",
          fontWeight: "700",
          color: theme.colors.text.primary,
          margin: 0,
        }}
      >
        Attendance Calender
      </h1>
      <div
        style={{
          ...headerCommonStyle,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: "center",
          padding: isMobile ? "4px 8px" : "12px 16px",
          gap: isMobile ? "8px" : "0",
          marginTop: isMobile ? "15px" : "20px",
          paddingTop : isMobile? "8px" : "10px",
          paddingBottom: isMobile? "8px" : "10px",
        }}
      >
        <div style={summariesContainerStyle}>
          <div
            style={{
              ...boxStyle,
              backgroundColor: "transparent",
               border: `${isMobile ? '1px' : '2px'} solid ${theme.colors.secondary}`,
              borderRadius: isMobile ? "10px" : "8px",
              padding: isMobile ? "6px 8px" : "8px 12px",
            }}
          >
            {totalHours.toFixed(1)}
            <div style={{ ...labelStyle, color: theme.colors.black }}>
              Total Hours
            </div>
          </div>
          <div
            style={{
              ...boxStyle,
              backgroundColor: "transparent",
              border: `${isMobile ? '1px' : '2px'} solid ${theme.colors.success}`,
              borderRadius: isMobile ? "10px" : "8px",
              padding: isMobile ? "6px 8px" : "8px 12px",
            }}
          >
            {presentDays}
            <div style={{ ...labelStyle, color: theme.colors.black }}>
              Days Present
            </div>
          </div>
          <div
            style={{
              ...boxStyle,
              backgroundColor: "transparent",
              border: `${isMobile ? '1px' : '2px'} solid ${theme.colors.error}`,
              borderRadius: isMobile ? "10px" : "8px",
              padding: isMobile ? "6px 8px" : "8px 12px",
            }}
          >
            {absentDays}
            <div style={{ ...labelStyle, color: theme.colors.black }}>
              Days Absent
            </div>
          </div>
        </div>

        {canViewAll && employees.length > 0 && (
          <div
            style={{
              width: isMobile ? "100%" : "auto",
              display: "flex",
              alignItems: "baseline",
              justifyContent: isMobile ? "flex-end" : "center",
              
            }}
          >
            <div
              style={{
                width: isMobile ? "230px" : "350px",
              }}
            >
              <FormControl fullWidth size="small">
                <Select
                  value={selectedEmpCode || ""}
                  onChange={(e) => setSelectedEmpCode(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    // If nothing selected → show placeholder
                    if (!selected) {
                      return (
                        <em
                          style={{
                            color: theme.colors.text.secondary,
                            fontStyle: "italic",
                          }}
                        >
                          Select Employee
                        </em>
                      );
                    }

                    // If user selects their own empCode → show placeholder instead of name
                    const isOwn = selected === user?.empCode;
                    if (isOwn) {
                      return (
                        <em
                          style={{
                            color: theme.colors.text.secondary,
                            fontStyle: "italic",
                          }}
                        >
                          Select Employee
                        </em>
                      );
                    }

                    // Otherwise show employee name or fallback to empCode
                    const employeeName =
                      employees.find((emp) => emp.empCode === selected)?.name ||
                      selected;

                    return employeeName;
                  }}
                  sx={{
                    backgroundColor: "#fff", // white background
                    borderRadius: "6px",
                    fontSize: isMobile ? "12px" : "14px",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiSelect-select": {
                      padding: isMobile ? "6px 10px" : "8px 12px",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <em
                      style={{
                        fontStyle: "italic",
                        color: theme.colors.text.secondary,
                      }}
                    >
                      Select Employee
                    </em>
                  </MenuItem>

                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.empCode}>
                      {emp.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        )}
      </div>

      <Calendar
        year={currentDate.getFullYear()}
        month={currentDate.getMonth()}
        events={events}
        mode="attendance"
        darkTheme={false}
        today={today}
        onPrevMonth={() => handleMonthChange(-1)}
        onNextMonth={() => handleMonthChange(1)}
        isMobile={isMobile}
        buttonStyle={{
          background: `${theme.colors.primary}`,
          border: "2px solid white",
          color: "#fff",
          padding: isMobile ? "8px 12px" : "8px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: isMobile ? "10px" : "12px",
          fontWeight: "bold",
          transition: "0.3s",
        }}
      />
    </div>
  );
};

export default Attendance;