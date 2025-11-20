// Updated Leave.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import Calendar from "../../components/common/Calendar";
import { theme } from "../../theme/theme";
import { AttendanceAPI } from "../../api/attendanceApi";
import { AllemployeeApi } from "../../api/getallemployeeApi";
import {
  Select,
  MenuItem,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button as MuiButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CustomLoader from "../../components/common/CustomLoader";
import Button from "../../components/common/Button";

const Leave = () => {
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
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const role = user?.role || "USER";
  const canViewAll = ["MANAGER", "ADMIN", "HR"].includes(role);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Selection states for leave application
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [showNextMonthButton, setShowNextMonthButton] = useState(false);

  // Ref for synchronous isSelecting access
  const isSelectingRef = useRef(false);

  useEffect(() => {
    isSelectingRef.current = isSelecting;
  }, [isSelecting]);

  // Leaves list
  const [leaves, setLeaves] = useState([]);

  // Pending leaves for manager (mock; replace with API fetch)
  const [pendingLeaves, setPendingLeaves] = useState([]);

  // Holidays (dummy; replace with API fetch if needed)
  const holidays = [
    "2025-10-05",
    "2025-10-18",
    "2025-10-25",
    "2025-11-05",
    "2025-11-15",
  ];

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

  // Fetch leaves (mock for now; replace with actual LeaveAPI.getLeaves(selectedEmpCode))
  useEffect(() => {
    if (!selectedEmpCode) return;
    const fetchLeaves = async () => {
      try {
        // Mock data; in real, await LeaveAPI.getLeavesByEmployee(selectedEmpCode)
        const mockLeaves = [
          {
            id: 1,
            start: "2025-10-01",
            end: "2025-10-03",
            days: 3,
            status: "Approved",
          },
          {
            id: 2,
            start: "2025-10-15",
            end: "2025-10-15",
            days: 1,
            status: "Pending",
          },
        ];
        setLeaves(mockLeaves);
      } catch (err) {
        console.error("Error fetching leaves:", err);
      }
    };
    fetchLeaves();
  }, [selectedEmpCode]);

  // Fetch pending leaves for manager (mock)
  useEffect(() => {
    if (role === "MANAGER") {
      const fetchPendingLeaves = async () => {
        try {
          // Mock data; in real, await LeaveAPI.getPendingLeavesForManager()
          const mockPending = [
            {
              id: 3,
              empCode: "EMP002",
              start: "2025-11-01",
              end: "2025-11-08",
              days: 8,
              status: "Pending",
            },
            {
              id: 4,
              empCode: "EMP003",
              start: "2025-11-10",
              end: "2025-11-10",
              days: 1,
              status: "Pending",
            },
          ];
          setPendingLeaves(mockPending);
        } catch (err) {
          console.error("Error fetching pending leaves:", err);
        }
      };
      fetchPendingLeaves();
    }
  }, [role]);

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

  // Transform API data for calendar (adapt for leave view if needed)
  const attendanceEvents = attendanceData.map((item) => ({
    date: item.date,
    type: item.status === "Absent" ? "Leave" : "Present",
    label:
      item.status === "Absent"
        ? "Absent"
        : calculateHours(item.checkIn, item.checkOut),
  }));

  // Add holidays to events
  const events = [
    ...attendanceEvents,
    ...holidays.map((date) => ({ date, type: "Holiday", label: "Holiday" })),
  ];

  // Range selector skipping weekends, holidays, and past dates
  const getDatesInRange = (start, end) => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const minDate = new Date(Math.min(startDate, endDate));
    const maxDate = new Date(Math.max(startDate, endDate));

    const dates = [];
    let current = new Date(minDate);

    while (current <= maxDate) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const dayOfWeek = current.getDay(); // 0=Sunday, 6=Saturday
      const isHoliday = holidays.includes(dateStr);

      // Skip past dates, weekends, and holidays
      if (
        dateStr > todayStr &&
        dayOfWeek !== 0 &&
        dayOfWeek !== 6 &&
        !isHoliday
      ) {
        dates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Confirmed dates from leaves
  const allConfirmedDates = useMemo(
    () => leaves.flatMap((leave) => getDatesInRange(leave.start, leave.end)),
    [leaves]
  );

  // Totals (labels adjusted for leave context; Absent as Used Leaves)
  const totalHours = attendanceData
    .filter((a) => a.status !== "Absent")
    .reduce((sum, a) => {
      const hours = calculateHours(a.checkIn, a.checkOut);
      return sum + (hours !== "Absent" ? parseFloat(hours) : 0);
    }, 0);

  const absentDays = attendanceData.filter((a) => a.status === "Absent").length;
  const presentDays = attendanceData.length - absentDays;

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);

    if (isSelectingRef.current) {
      const newYear = newDate.getFullYear();
      const newMonth = newDate.getMonth();
      const newDragEndDate =
        direction > 0
          ? new Date(newYear, newMonth, 1)
          : new Date(newYear, newMonth + 1, 0);

      const newDragEndStr = `${newDragEndDate.getFullYear()}-${String(
        newDragEndDate.getMonth() + 1
      ).padStart(2, "0")}-${String(newDragEndDate.getDate()).padStart(2, "0")}`;
      setDragEnd(newDragEndStr);
      const dates = getDatesInRange(dragStart, newDragEndStr);
      setSelectedDates(dates);
    }
    setShowNextMonthButton(false);
  };

  // Handle selection change for leave range
  const handleSelectionChange = (dateStr, action) => {
    if (action === "end") {
      if (startDate && selectedDates.length > 0) {
        const endStr = selectedDates[selectedDates.length - 1];
        setEndDate(endStr);
      }
      isSelectingRef.current = false;
      setIsSelecting(false);
      return;
    }

    if (!dateStr || dateStr <= todayStr) return;

    const date = new Date(dateStr);
    const clickedDay = date.getDay();
    const isHoliday = holidays.includes(dateStr);

    // Skip weekends & holidays instantly
    if (clickedDay === 0 || clickedDay === 6 || isHoliday) return;

    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    if (action === "click") {
      if (!startDate) {
        // First click: set start
        setStartDate(dateStr);
        setDragStart(dateStr);
        setDragEnd(dateStr);
        const dates = [dateStr];
        setSelectedDates(dates);
        isSelectingRef.current = true;
        setIsSelecting(true);
        setShowNextMonthButton(date.getDate() === lastDay);
      } else {
        // Second click: set end and complete selection
        setEndDate(dateStr);
        setDragEnd(dateStr);
        const dates = getDatesInRange(startDate, dateStr);
        setSelectedDates(dates);
        isSelectingRef.current = false;
        setIsSelecting(false);
        setShowNextMonthButton(false);
      }
    } else if (action === "hover" && isSelectingRef.current) {
      // Hover: update temporary range
      setDragEnd(dateStr);
      const dates = getDatesInRange(dragStart, dateStr);
      setSelectedDates(dates);
      setShowNextMonthButton(date.getDate() === lastDay);
    }
  };

  const handleEdgeHover = (direction, dayNum) => {
    if (isSelectingRef.current) {
      const lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();
      setShowNextMonthButton(direction === "next" && dayNum === lastDay);
    }
  };

  const handleCancel = () => {
    setIsApplyingLeave(false);
    setStartDate(null);
    setEndDate(null);
    isSelectingRef.current = false;
    setIsSelecting(false);
    setSelectedDates([]);
    setDragStart(null);
    setDragEnd(null);
    setShowNextMonthButton(false);
  };

  const handleConfirm = async () => {
    if (!startDate || !endDate || selectedDates.length === 0) return;
    try {
      // TODO: Call API to apply leave, e.g., await LeaveAPI.applyLeave(selectedEmpCode, startDate, endDate, selectedDates)
      console.log("Applying leave for dates:", selectedDates);
      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // After success, add to leaves (in real, refetch leaves)
      const newLeave = {
        id: Date.now(),
        start: startDate,
        end: endDate,
        days: selectedDates.length,
        status: "Pending",
      };
      setLeaves((prev) => [...prev, newLeave]);
      // Optionally refetch attendance if it updates status
    } catch (err) {
      console.error("Error applying leave:", err);
      // Handle error
    } finally {
      handleCancel();
    }
  };

  // Modal states for delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLeaveToDelete, setSelectedLeaveToDelete] = useState(null);

  const handleDeleteClick = (leave) => {
    setSelectedLeaveToDelete(leave);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedLeaveToDelete) {
      setLeaves((prev) =>
        prev.filter((l) => l.id !== selectedLeaveToDelete.id)
      );
      // TODO: Call API to delete leave
    }
    setDeleteModalOpen(false);
    setSelectedLeaveToDelete(null);
  };

  // Modal states for approve/reject
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setActionType("approve");
    setActionModalOpen(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setActionType("reject");
    setActionModalOpen(true);
  };

  const handleActionConfirm = () => {
    if (selectedRequest) {
      setPendingLeaves((prev) =>
        prev
          .map((req) =>
            req.id === selectedRequest.id
              ? {
                  ...req,
                  status: actionType === "approve" ? "Approved" : "Rejected",
                }
              : req
          )
          .filter((req) => req.status === "Pending")
      ); // Remove from pending if action taken
      // TODO: Call API to approve/reject leave
    }
    setActionModalOpen(false);
    setSelectedRequest(null);
    setActionType("");
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
        paddingBottom: "3px",
      }
    : summaryBoxesStyle;

  // Custom theme reference (assuming customTheme is available; adjust if needed)
  const customTheme = theme; // Use existing theme or import custom one

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
        Leave Calendar
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
          paddingTop: isMobile ? "8px" : "10px",
          paddingBottom: isMobile ? "8px" : "10px",
        }}
      >
        <div style={summariesContainerStyle}>
          <div
            style={{
              ...boxStyle,
              backgroundColor: "transparent",
              border: `${isMobile ? "1px" : "2px"} solid ${
                theme.colors.secondary
              }`,
              borderRadius: isMobile ? "10px" : "8px",
              padding: isMobile ? "6px 8px" : "8px 12px",
            }}
          >
            {totalHours.toFixed(1)}
            <div style={{ ...labelStyle, color: theme.colors.black }}>
              Leave Count
            </div>
          </div>
          <div
            style={{
              ...boxStyle,
              backgroundColor: "transparent",
              border: `${isMobile ? "1px" : "2px"} solid ${
                theme.colors.success
              }`,
              borderRadius: isMobile ? "10px" : "8px",
              padding: isMobile ? "6px 8px" : "8px 12px",
            }}
          >
            {presentDays}
            <div style={{ ...labelStyle, color: theme.colors.black }}>
              Leave Remmaning
            </div>
          </div>
          <div
            style={{
              ...boxStyle,
              backgroundColor: "transparent",
              border: `${isMobile ? "1px" : "2px"} solid ${theme.colors.error}`,
              borderRadius: isMobile ? "10px" : "8px",
              padding: isMobile ? "6px 8px" : "8px 12px",
            }}
          >
            {absentDays}
            <div style={{ ...labelStyle, color: theme.colors.black }}>
              Applied Leaves
            </div>
          </div>
        </div>
        <div
          style={{
            width: isMobile ? "100%" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          {!isApplyingLeave ? (
            <Button type="primary" onClick={() => setIsApplyingLeave(true)}>
              Apply Leave
            </Button>
          ) : endDate ? (
            <>
              <Button type="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" onClick={handleConfirm}>
                Confirm
              </Button>
            </>
          ) : (
            <Button type="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          events={events}
          mode="leave"
          selectedDates={selectedDates}
          confirmedDates={allConfirmedDates}
          onSelectionChange={handleSelectionChange}
          isSelecting={isSelecting}
          isSelectionMode={isApplyingLeave}
          darkTheme={false}
          today={today}
          onEdgeHover={handleEdgeHover}
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

        {showNextMonthButton && !isMobile && (
          <button
            onClick={() => handleMonthChange(1)}
            style={{
              position: "absolute",
              bottom: "15px",
              left: "calc(100% + 10px)",
              background: "#e69346ff",
              border: "none",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "#dd911fff")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "#e6a545ff")}
          >
            →
          </button>
        )}
      </div>

      {/* Applied Leaves Table */}
      {leaves.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2
            style={{
              fontSize: "20px",
              color: theme.colors.text.primary,
              marginBottom: "16px",
            }}
          >
            Applied Leaves
          </h2>
          <Paper
            sx={{
              overflowX: "auto",
              borderRadius: customTheme.borderRadius?.large || "8px",
              boxShadow:
                customTheme.shadows?.medium || "0px 2px 4px rgba(0,0,0,0.1)",
              backgroundColor: customTheme.colors?.surface || "#fff",
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 300 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: customTheme.colors.gray }}>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.start}</TableCell>
                      <TableCell>{leave.end}</TableCell>
                      <TableCell>{leave.days}</TableCell>
                      <TableCell>{leave.status}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleDeleteClick(leave)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this leave application?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton
            onClick={() => setDeleteModalOpen(false)}
            color="secondary"
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Confirm ({selectedLeaveToDelete?.days || 0})
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Manager's Leave Requests Table */}
      {["MANAGER", "ADMIN", "HR"].includes(role) &&
        Array.isArray(pendingLeaves) &&
        pendingLeaves.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h2
              style={{
                fontSize: "20px",
                color: theme.colors.text.primary,
                marginBottom: "16px",
              }}
            >
              Leave Requests
            </h2>
            <Paper
              sx={{
                overflowX: "auto",
                borderRadius: customTheme.borderRadius?.large || "8px",
                boxShadow:
                  customTheme.shadows?.medium || "0px 2px 4px rgba(0,0,0,0.1)",
                backgroundColor: customTheme.colors?.surface || "#fff",
              }}
            >
              <TableContainer>
                <Table sx={{ minWidth: 300 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: customTheme.colors.primaryLight }}>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingLeaves.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.start}</TableCell>
                        <TableCell>{request.end}</TableCell>
                        <TableCell>{request.days}</TableCell>
                        <TableCell>{request.status}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleApproveClick(request)}
                            color="success"
                            size="small"
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleRejectClick(request)}
                            color="error"
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        )}

      {/* Approve/Reject Action Dialog */}
      <Dialog open={actionModalOpen} onClose={() => setActionModalOpen(false)}>
        <DialogTitle>
          {actionType === "approve" ? "Approve Leave" : "Reject Leave"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType} this leave request?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton
            onClick={() => setActionModalOpen(false)}
            color="secondary"
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleActionConfirm}
            color={actionType === "approve" ? "success" : "error"}
            variant="contained"
          >
            {actionType === "approve" ? "Approve" : "Reject"} (
            {selectedRequest?.days || 0})
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Leave;
