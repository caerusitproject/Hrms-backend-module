// Leave.jsx (Updated - Only logic changes, no style changes)
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import Calendar from "../../components/common/Calendar";
import { theme } from "../../theme/theme";
import { AllemployeeApi } from "../../api/getallemployeeApi";
import { LeaveAPI } from "../../api/leaveApi"; // ← Changed import
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
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CustomLoader from "../../components/common/CustomLoader";
import Button from "../../components/common/Button";
import { ManagerAPI } from "../../api/managerApi";
const Leave = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpCode, setSelectedEmpCode] = useState("");
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const role = user?.role || "USER";
  const canViewAll = ["MANAGER", "ADMIN", "HR"].includes(role);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Selection states
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [showNextMonthButton, setShowNextMonthButton] = useState(false);
  const isSelectingRef = useRef(false);

  // New: Reason dialog
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");

  // Leaves from API
  const [leaves, setLeaves] = useState([]);

  // Pending leaves for manager (your requested block - unchanged)
  const [pendingLeaves, setPendingLeaves] = useState([]);

  // Holidays
  const holidays = [];

  const isDateAlreadyOnLeave = (dateStr) => {
    return leaves.some((leave) => {
      const leaveStart = new Date(leave.start);
      const leaveEnd = new Date(leave.end);
      const checkDate = new Date(dateStr);
      return checkDate >= leaveStart && checkDate <= leaveEnd;
    });
  };

  useEffect(() => {
    isSelectingRef.current = isSelecting;
  }, [isSelecting]);

  useEffect(() => {
    if (user?.empCode) {
      setSelectedEmpCode(user.empCode);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch employees
  // useEffect(() => {
  //   if (canViewAll) {
  //     const fetchEmployees = async () => {
  //       try {
  //         setEmployeesLoading(true);
  //         const response = await AllemployeeApi.getEmployeesByRole();
  //         if (response.success) {
  //           setEmployees(response.data.employeeList || []);
  //           if (user?.id) {
  //             const currentEmp = response.data.employeeList.find(
  //               (emp) => emp.id === user.id.toString()
  //             );
  //             if (currentEmp) setSelectedEmpCode(currentEmp.empCode);
  //           }
  //         }
  //       } catch (err) {
  //         console.error("Error fetching employees:", err);
  //       } finally {
  //         setEmployeesLoading(false);
  //       }
  //     };
  //     fetchEmployees();
  //   }
  // }, [canViewAll, user]);

  // Fetch leaves from API
  useEffect(() => {
    if (!selectedEmpCode) return;

    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await LeaveAPI.getLeaveList();
        if (res && res.leaves) {
          const formattedLeaves = res.leaves.map((l) => ({
            id: l.id,
            start: l.startDate.split("T")[0],
            end: l.endDate.split("T")[0],
            reason: l.reason,
            status:
              l.status === "PENDING"
                ? "Pending"
                : l.status === "APPROVED"
                  ? "Approved"
                  : "Rejected",
            days: 0, // will be recalculated if needed
          }));
          setLeaves(formattedLeaves);
        }
      } catch (err) {
        console.error("Error fetching leaves:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [selectedEmpCode]);

  // Manager pending leaves - YOUR EXACT BLOCK (unchanged)
  const fetchPendingLeaves = async () => {
    try {
      const res = await ManagerAPI.leaveList();

      // res.subordinateLeaves contains all pending leave objects
      setPendingLeaves(res?.subordinateLeaves || []);
    } catch (err) {
      console.error("Error fetching pending leaves:", err);
    }
  };

  useEffect(() => {
    if (role === "MANAGER") {
      fetchPendingLeaves();
    }
  }, [role]);

  // Helper: calculate working days (skip weekends/holidays)
  const getDatesInRange = (start, end) => {
    if (!start || !end) return [];
    const dates = [];
    let current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];
      const day = current.getDay();
      if (
        day !== 0 &&
        day !== 6 &&
        !holidays.includes(dateStr) &&
        dateStr > todayStr
      ) {
        dates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const allConfirmedDates = useMemo(
    () => leaves.flatMap((l) => getDatesInRange(l.start, l.end)),
    [leaves]
  );

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);

    if (isSelectingRef.current && dragStart) {
      const newDragEnd =
        direction > 0
          ? new Date(newDate.getFullYear(), newDate.getMonth(), 1)
          : new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
      const newEndStr = newDragEnd.toISOString().split("T")[0];
      setDragEnd(newEndStr);
      setSelectedDates(getDatesInRange(dragStart, newEndStr));
    }
    setShowNextMonthButton(false);
  };

  // 2. Update your handleSelectionChange function — replace the weekend/holiday check with this:
  const handleSelectionChange = (dateStr, action) => {
    if (action === "end") {
      if (startDate && selectedDates.length > 0) {
        setEndDate(selectedDates[selectedDates.length - 1]);
      }
      setIsSelecting(false);
      isSelectingRef.current = false;
      return;
    }

    // Block past dates, weekends, holidays, AND dates already on leave
    if (
      !dateStr ||
      dateStr <= todayStr ||
      isDateAlreadyOnLeave(dateStr) || // ← NEW: already taken leave
      new Date(dateStr).getDay() === 0 ||
      new Date(dateStr).getDay() === 6 ||
      holidays.includes(dateStr)
    ) {
      return;
    }

    // ... rest of your existing logic stays exactly the same
    if (action === "click") {
      if (!startDate) {
        setStartDate(dateStr);
        setDragStart(dateStr);
        setDragEnd(dateStr);
        setSelectedDates([dateStr]);
        setIsSelecting(true);
        isSelectingRef.current = true;
      } else {
        setEndDate(dateStr);
        setDragEnd(dateStr);
        setSelectedDates(getDatesInRange(startDate, dateStr));
        setIsSelecting(false);
        isSelectingRef.current = false;
      }
    } else if (action === "hover" && isSelectingRef.current) {
      setDragEnd(dateStr);
      setSelectedDates(getDatesInRange(dragStart, dateStr));
    }
  };

  const handleCancel = () => {
    setIsApplyingLeave(false);
    setStartDate(null);
    setEndDate(null);
    setSelectedDates([]);
    setDragStart(null);
    setDragEnd(null);
    setIsSelecting(false);
    isSelectingRef.current = false;
    setShowNextMonthButton(false);
    setLeaveReason("");
    setReasonDialogOpen(false);
  };

  // Open reason dialog instead of direct confirm
  const handleConfirmClick = () => {
    if (!startDate || !endDate || selectedDates.length === 0) return;
    setReasonDialogOpen(true);
  };

  // Final apply with reason
  const handleApplyWithReason = async () => {
    if (!leaveReason.trim()) return;

    try {
      const payload = {
        type: "Casual Leave",
        startDate: startDate,
        endDate: endDate,
        reason: leaveReason,
      };

      await LeaveAPI.applyLeaves(payload);

      // Optimistically add to list
      const newLeave = {
        id: Date.now(),
        start: startDate,
        end: endDate,
        reason: leaveReason,
        status: "Pending",
      };
      setLeaves((prev) => [...prev, newLeave]);
    } catch (err) {
      console.error("Failed to apply leave:", err);
      alert("Failed to apply leave. Please try again.");
    } finally {
      handleCancel();
    }
  };

  // Delete leave
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);

  const handleDelete = (leave) => {
    setLeaveToDelete(leave);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!leaveToDelete) return;
    try {
      //console.log("Deleting leave ID:", leaveToDelete.id);
      await LeaveAPI.deleteLeave(leaveToDelete.id);
      setLeaves((prev) => prev.filter((l) => l.id !== leaveToDelete.id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleteModalOpen(false);
    setLeaveToDelete(null);
  };

  // Manager approve/reject (mock actions)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState("");

  const handleApproveClick = (req) => {
    setSelectedRequest(req);
    setActionType("approve");
    setActionModalOpen(true);
  };

  const handleRejectClick = (req) => {
    setSelectedRequest(req);
    setActionType("reject");
    setActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedRequest) return;

    const newStatus =
      actionType === "approve" ? "APPROVED" : "REJECTED";

    try {
      console.log("Req:", selectedRequest.id, newStatus);

      // 🔥 1. Call API to update status
      await ManagerAPI.leaveStatus(selectedRequest.id, newStatus);

      // 🔥 2. Re-fetch fresh leave data from backend
      await fetchPendingLeaves();

    } catch (err) {
      console.error("Failed to update leave status:", err);
    }

    // 🔥 3. Close modal + reset
    setActionModalOpen(false);
    setSelectedRequest(null);
    setActionType("");
  };


  // Styles remain 100% unchanged
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
      gap: "20px",
      justifyContent: "center",
      paddingBottom: "3px",
    }
    : summaryBoxesStyle;

  if (loading || employeesLoading) return <CustomLoader />;
  if (error) return <div>Error: {error}</div>;

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

      {/* Header & Summary Boxes - unchanged */}
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
              border: `${isMobile ? "1px" : "2px"} solid ${theme.colors.secondary
                }`,
              borderRadius: isMobile ? "10px" : "8px",
              padding: isMobile ? "6px 8px" : "8px 12px",
            }}
          >
            18
            <div style={{ ...labelStyle, color: theme.colors.black }}>
              Leave Count
            </div>
          </div>
          <div
            style={{
              ...boxStyle,
              backgroundColor: "transparent",
              border: `${isMobile ? "1px" : "2px"} solid ${theme.colors.success
                }`,
              borderRadius: isMobile ? "10px" : "8px",
              padding: isMobile ? "6px 8px" : "8px 12px",
            }}
          >
            12
            <div style={{ ...labelStyle, color: theme.colors.black }}>
              Leave Remaining
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
            {leaves.length}
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
              <Button type="primary" onClick={handleConfirmClick}>
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

      {/* Calendar - unchanged */}
      <div style={{ position: "relative" }}>
        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          events={[]}
          mode="leave"
          selectedDates={selectedDates}
          confirmedDates={allConfirmedDates}
          onSelectionChange={handleSelectionChange}
          isSelecting={isSelecting}
          isSelectionMode={isApplyingLeave}
          darkTheme={false}
          today={today}
          onEdgeHover={(dir, day) =>
            isSelectingRef.current &&
            setShowNextMonthButton(
              dir === "next" &&
              day ===
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
              ).getDate()
            )
          }
          onPrevMonth={() => handleMonthChange(-1)}
          onNextMonth={() => handleMonthChange(1)}
          isMobile={isMobile}
          buttonStyle={{
            background: theme.colors.primary,
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

      {/* Applied Leaves Table - Real Data */}
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
              borderRadius: "8px",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 300 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.colors.gray }}>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.start.slice(0, 10)}</TableCell>
                      <TableCell>{leave.end.slice(0, 10)}</TableCell>
                      <TableCell>{leave.reason || "-"}</TableCell>
                      <TableCell>{leave.status}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleDelete(leave)}
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

      {/* Reason Dialog */}
      <Dialog
        open={reasonDialogOpen}
        onClose={() => setReasonDialogOpen(false)}
        sx={{
          "& .MuiPaper-root": {
            width: "450px",
            height: "300px",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>Reason for Leave</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            multiline
            rows={3}
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: theme.colors.primary,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.colors.primary,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button type="secondary" onClick={() => setReasonDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyWithReason}
            variant="contained"
            type="primary"
            disabled={!leaveReason.trim()}
          >
            Apply Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this leave application?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button type="primary" onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manager Pending Requests - unchanged */}
      {["MANAGER", "ADMIN", "HR"].includes(role) &&
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
                borderRadius: "8px",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
              }}
            >
              <TableContainer>
                <Table sx={{ minWidth: 300 }}>
                  <TableHead>
                    <TableRow
                      sx={{ backgroundColor: theme.colors.primaryLight }}
                    >
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      {/* <TableCell>Days</TableCell> */}
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingLeaves.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.startDate}</TableCell>
                        <TableCell>{request.endDate}</TableCell>
                        {/* <TableCell>{request.days}</TableCell> */}
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

      {/* Approve/Reject Dialog */}
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
          <Button type="secondary" onClick={() => setActionModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleActionConfirm}
            color={actionType === "approve" ? "success" : "error"}
            variant="contained"
          >
            {actionType === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Leave;
