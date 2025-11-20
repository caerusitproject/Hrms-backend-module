"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import { Edit, Wallet, TrendingUp, TrendingDown } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { PayrollApi } from "../../api/payrollApi";
import { theme } from "../../theme/theme";
import Button from "../../components/common/Button";

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
}));

const StyledFormCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
}));

const TotalBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  background: "#f7e9dbff",
  border: `1px solid ${theme.palette.divider}`,
}));



const earningsFields = [
  "baseSalary",
  "bonus",
  "incentives",
  "overtimePay",
  "commission",
  "allowances",
  "hra",
  "da",
  "lta",
  "medicalAllowance",
];

const deductionsFields = [
  "pf",
  "esi",
  "gratuity",
  "professionalTax",
  "incomeTax",
  "deductions",
];

const formFields = [...earningsFields, ...deductionsFields];

const initialFormData = {
  baseSalary: "",
  bonus: "",
  incentives: "",
  overtimePay: "",
  commission: "",
  allowances: "",
  hra: "",
  da: "",
  lta: "",
  medicalAllowance: "",
  pf: "",
  esi: "",
  gratuity: "",
  professionalTax: "",
  incomeTax: "",
  deductions: "",
  remarks: "",
  effectiveFrom: new Date().toISOString().split("T")[0],
};

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeError, setEmployeeError] = useState("");
  const [baseSalaryError, setBaseSalaryError] = useState("");
  const totals = useMemo(() => {
    const totalEarnings = earningsFields.reduce(
      (sum, field) => sum + (Number.parseFloat(formData[field]) || 0),
      0
    );
    const totalDeductions = deductionsFields.reduce(
      (sum, field) => sum + (Number.parseFloat(formData[field]) || 0),
      0
    );
    return {
      totalEarnings,
      totalDeductions,
      netSalary: totalEarnings - totalDeductions,
    };
  }, [formData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payrolls
        const payrollData = await PayrollApi.getallPayroll();
        setPayrolls(payrollData);

        // Fetch employees
        const employeeData = await PayrollApi.getAllEmployees();
        setEmployees(employeeData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    console.log("Changed field:", e.target.name, "Value:", e.target.value);
    if(e.target.name === "baseSalary") {
      {
        const validationMsg = validateBaseSalary(e.target.value);
        setBaseSalaryError(validationMsg);
      }
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const validateEmployeeSelection = (selectedEmployee) => {
    if (!selectedEmployee) {
      return "Please select an employee.";
    }
    return "";
  };
  const validateBaseSalary = (baseSalary) => {
    if (!baseSalary || Number(baseSalary) <= 0) {
      return "Base Salary Required.";
    }
    return "";
  };
  const handleSave = async () => {
    const validationMessage = validateEmployeeSelection(selectedEmployee);

    if (validationMessage) {
      setEmployeeError(validationMessage); // show red message under Select
      return; // stop saving
    }

    // Clear error when valid
    setEmployeeError("");
    const baseSalaryValidationMsg = validateBaseSalary(formData.baseSalary);
    if (baseSalaryValidationMsg) {
      setBaseSalaryError(baseSalaryValidationMsg);
      return;
    }
    setBaseSalaryError("");

    const payload = {
      ...formatNumberFields(formData),
      ...totals,
      employeeId: selectedEmployee,
    };
    try {
      console.log("Saving payroll with payload:", payload);
      await PayrollApi.craetepayroll(payload);
      setFormData(initialFormData);
      setSelectedEmployee("");
      const updatedPayrolls = await PayrollApi.getallPayroll();
      setPayrolls(updatedPayrolls);
    } catch (error) {
      console.error("Error saving compensation:", error);
      //alert("Error saving compensation.");
    }
  };

  const handleEditClick = async (id) => {
    try {
      const data = await PayrollApi.getpayrollById(id);
      setFormData({
        baseSalary: data.baseSalary || "",
        bonus: data.bonus || "",
        incentives: data.incentives || "",
        overtimePay: data.overtimePay || "",
        commission: data.commission || "",
        allowances: data.allowances || "",
        hra: data.hra || "",
        da: data.da || "",
        lta: data.lta || "",
        medicalAllowance: data.medicalAllowance || "",
        pf: data.pf || "",
        esi: data.esi || "",
        gratuity: data.gratuity || "",
        professionalTax: data.professionalTax || "",
        incomeTax: data.incomeTax || "",
        deductions: data.deductions || "",
        remarks: data.remarks || "",
        effectiveFrom: data.effectiveFrom
          ? new Date(data.effectiveFrom).toISOString().split("T")[0]
          : "",
      });
      setEditingPayroll(data);
      setOpenEditModal(true);
    } catch (error) {
      console.error("Error fetching payroll:", error);
      setOpenEditModal(true);
    }
  };

  const handleUpdate = async () => {
    const payload = {
      id: editingPayroll.id,
       employeeId: editingPayroll.employeeId,
      ...formatNumberFields(formData),
      ...totals,
    };
    try {
      console.log("Updating payroll with payload:", payload); 
      await PayrollApi.craetepayroll(payload);
      setOpenEditModal(false);
      setEditingPayroll(null);
      setFormData(initialFormData);
      const updatedPayrolls = await PayrollApi.getallPayroll();
      setPayrolls(updatedPayrolls);
    } catch (error) {
      console.error("Error updating payroll:", error);
      //alert("Error updating payroll.");
    }
  };

  const handleCloseModal = () => {
    setOpenEditModal(false);
    setEditingPayroll(null);
    setFormData(initialFormData);
  };

  const renderTotals = () => (
    <Grid item xs={12}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TotalBox elevation={0}>
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingUp sx={{ color: "success.main", fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Total Earnings
                </Typography>
              </Stack>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "success.main" }}
              >
                ₹{Number(totals.totalEarnings || 0).toLocaleString()}
              </Typography>
            </Stack>
          </TotalBox>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TotalBox elevation={0}>
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingDown sx={{ color: "error.main", fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Total Deductions
                </Typography>
              </Stack>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "error.main" }}
              >
                ₹{Number(totals.totalDeductions || 0).toLocaleString()}
              </Typography>
            </Stack>
          </TotalBox>
        </Grid>

        <Grid item xs={12} md={4}>
          <TotalBox elevation={0}>
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Wallet sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Net Salary
                </Typography>
              </Stack>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "primary.main" }}
              >
                ₹{Number(totals.netSalary || 0).toLocaleString()}
              </Typography>
            </Stack>
          </TotalBox>
        </Grid>
      </Grid>
    </Grid>
  );

  const formatNumberFields = (data) => {
    const formatted = {};

    formFields.forEach((field) => {
      const value = data[field];
      const numberValue = Number.parseFloat(value || 0);
      formatted[field] = numberValue.toFixed(2); // Converts to 15000.00 format
    });

    return {
      ...data,
      ...formatted,
    };
  };

  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          Payroll Management
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Manage employee compensation and payroll details
        </Typography>
      </Box>

      <StyledFormCard sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            mb={3}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box
              sx={{
                width: 5,
                height: 24,
                background: theme.colors.primary,
                borderRadius: 1,
              }}
            />
            Compensation Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  label="Select Employee"
                  onChange={(e) => {
                    setSelectedEmployee(e.target.value);
                    setEmployeeError(""); // clear error when user chooses a value
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.colors.primary,  // orange
                    }
                  }}
                >

                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} • {emp.empCode} • {emp.designation}
                    </MenuItem>
                  ))}
                </Select>
                {employeeError && (
                  <Typography variant="caption" color="error" sx={{ fontSize: 14 }}>
                    {employeeError}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "success.main", mb: 2 }}
              >
                Earnings
              </Typography>
              <Grid container spacing={2}>
                {earningsFields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <TextField
                      fullWidth
                      label={field
                        .replace(/([A-Z])/g, " $1") // insert space before capital letters
                        .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
                        .trim()}
                      name={field}
                      type="number"
                      value={formData[field]}
                      onChange={handleChange}

                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&.Mui-focused fieldset": {
                            borderColor: theme.colors.primary, // or theme.palette.border.large
                          },
                        },
                      }}
                    />
                    {baseSalaryError && field === "baseSalary" && (
                      <Typography variant="caption" color="error" sx={{ fontSize: 14, marginLeft:0}}>
                        {baseSalaryError}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "error.main", mb: 2, mt: 2 }}
              >
                Deductions
              </Typography>
              <Grid container spacing={2}>
                {deductionsFields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <TextField
                      fullWidth
                      label={field.replace(/([A-Z])/g, " $1").trim()}
                      name={field}
                      type="number"
                      value={formData[field]}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&.Mui-focused fieldset": {
                            borderColor: theme.colors.primary, // or theme.palette.border.large
                          },
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {renderTotals()}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    "&.Mui-focused fieldset": {
                      borderColor: theme.colors.primary, // or theme.palette.border.large
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Effective From"
                name="effectiveFrom"
                InputLabelProps={{ shrink: true }}
                value={formData.effectiveFrom}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    "&.Mui-focused fieldset": {
                      borderColor: theme.colors.primary, // or theme.palette.border.large
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  size="large"
                >
                  Save Compensation
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </StyledFormCard>

      <Dialog
        open={openEditModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
          Edit Payroll for {editingPayroll?.employee?.name}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "success.main", mb: 2 }}
              >
                Earnings
              </Typography>
              <Grid container spacing={2}>
                {earningsFields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <TextField
                      fullWidth
                      label={field.replace(/([A-Z])/g, " $1").trim()}
                      name={field}
                      type="number"
                      value={formData[field]}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&.Mui-focused fieldset": {
                            borderColor: theme.colors.primary, // or theme.palette.border.large
                          },
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "error.main", mb: 2, mt: 2 }}
              >
                Deductions
              </Typography>
              <Grid container spacing={2}>
                {deductionsFields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <TextField
                      fullWidth
                      label={field.replace(/([A-Z])/g, " $1").trim()}
                      name={field}
                      type="number"
                      value={formData[field]}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&.Mui-focused fieldset": {
                            borderColor: theme.colors.primary, // or theme.palette.border.large
                          },
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {renderTotals()}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    "&.Mui-focused fieldset": {
                      borderColor: theme.colors.primary, // or theme.palette.border.large
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Effective From"
                name="effectiveFrom"
                InputLabelProps={{ shrink: true }}
                value={formData.effectiveFrom}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    "&.Mui-focused fieldset": {
                      borderColor: theme.colors.primary, // or theme.palette.border.large
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button type="secondary" onClick={handleCloseModal} sx={{ borderRadius: 1.5 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Update Payroll
          </Button>
        </DialogActions>
      </Dialog>

      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          mb={3}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Box
            sx={{
              width: 5,
              height: 24,
              background: theme.colors.primary,
              borderRadius: 1,
            }}
          />
          Employee Payrolls
        </Typography>

        <Stack spacing={{ xs: 5, md: 7 }}>
          {payrolls.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No payroll records found. Create one to get started.
              </Typography>
            </Paper>
          ) : (
            payrolls.map((p) => (
              <StyledCard key={p.id} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        {p.employee.name}
                      </Typography>
                    </Stack>
                  }
                  subheader={
                    <Stack spacing={0.5} mt={0.5}>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {p.employee.designation} • {p.employee.empCode}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Effective From:{" "}
                        {new Date(p.effectiveFrom).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  }
                  action={
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(p.employee.id)}
                      sx={{
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "scale(1.1)",
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  }
                  sx={{ pb: 2 }}
                />

                <Divider />

                <CardContent sx={{ pt: 2 }}>
                  {/* ✅ Combine all amounts in one responsive row */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <Grid
                        container
                        spacing={2}
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Base Salary */}
                        <Grid item xs={12} sm={6} md={2.4}>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary", fontWeight: 600 }}
                            >
                              Base Salary
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              ₹{Number(p.baseSalary || 0).toLocaleString()}
                            </Typography>
                          </Stack>
                        </Grid>

                        {/* Bonus */}
                        <Grid item xs={12} sm={6} md={2.4}>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary", fontWeight: 600 }}
                            >
                              Bonus
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              ₹{Number(p.bonus || 0).toLocaleString()}
                            </Typography>
                          </Stack>
                        </Grid>

                        {/* Total Earnings */}
                        <Grid item xs={12} sm={6} md={2.4}>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              sx={{ color: "success.main", fontWeight: 600 }}
                            >
                              Total Earnings
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: "success.main" }}
                            >
                              ₹{Number(p.totalEarnings || 0).toLocaleString()}
                            </Typography>
                          </Stack>
                        </Grid>

                        {/* Total Deductions */}
                        <Grid item xs={12} sm={6} md={2.4}>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              sx={{ color: "error.main", fontWeight: 600 }}
                            >
                              Total Deductions
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: "error.main" }}
                            >
                              ₹{Number(p.totalDeductions || 0).toLocaleString()}
                            </Typography>
                          </Stack>
                        </Grid>

                        {/* Net Salary */}
                        <Grid item xs={12} sm={6} md={2.4}>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              sx={{ color: "primary.main", fontWeight: 600 }}
                            >
                              Net Salary
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: "primary.main" }}
                            >
                              ₹{Number(p.netSalary || 0).toLocaleString()}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            ))
          )}
        </Stack>
      </Box>
    </div >
  );
};

export default Payroll;
