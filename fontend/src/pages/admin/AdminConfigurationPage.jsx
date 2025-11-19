import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { Edit } from "lucide-react";
import { theme as customTheme } from "../../theme/theme";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";
import { ConfigApi as AdminApi } from "../../api/adminApi"; // Adjust path as needed

export default function AdminConfig() {
  const [activeTab, setActiveTab] = useState(0); // 0: Departments, 1: Account Management
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    deptid: null,
    id: null,
    departmentName: "",
    description: "",
    username: "",
    email: "",
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  // Load data
  useEffect(() => {
    if (activeTab === 1) fetchDepartments();
    if (activeTab === 0) fetchUsers();
  }, [activeTab]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await AdminApi.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      showAlert("error", "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await AdminApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      showAlert("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (severity, message) => {
    setAlertSeverity(severity);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleTabChange = (e, newValue) => setActiveTab(newValue);

  const handleOpen = (item = null) => {
    if (item) {
      if (activeTab === 0) {
        setFormData({
          id: item.id,
          username: item.username,
          email: item.email,
          departmentName: "",
          description: "",
        });
      } else {
        setFormData({
          deptid: item.id,
          departmentName: item.departmentName,
          description: item.description || "",
          username: "",
          email: "",
        });
      }
    } else {
      setFormData({
        id: null,
        departmentName: "",
        description: "",
        username: "",
        email: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (activeTab === 0) {
      if (!formData.email.trim()) {
        showAlert("error", "Email is required");
        return;
      }
      // console.log("Form Data:", formData);
      const { id, email, username } = formData;
      const payload = { id, email, username };

      try {
        await AdminApi.updateUserEmail(payload);
        showAlert("success", "User email updated successfully");
        fetchUsers();
      } catch (err) {
        showAlert("error", "Failed to update email");
      }
      // User - only email is editable
    } else {
      // Department
      if (!formData.departmentName.trim()) {
        showAlert("error", "Department name is required");
        return;
      }

      const { departmentName, description } = formData;

      const payload = {
        departmentName,
        description,
      };
      try {
        if (formData.deptid) {
          await AdminApi.updateDepartment(formData.deptid, payload);
          showAlert("success", "Department updated successfully");
        } else {
          await AdminApi.createDepartment({
            departmentName: formData.departmentName,
            description: formData.description,
          });
          showAlert("success", "Department created successfully");
        }
        fetchDepartments();
      } catch (err) {
        showAlert("error", "Failed to save department");
      }
    }

    setOpen(false);
    setFormData({
      id: null,
      departmentName: "",
      description: "",
      username: "",
      email: "",
    });
  };

  const currentData = activeTab === 0 ? users : departments;
  const currentType = activeTab === 0 ? "User Details" : "Department";

  return (
    <div>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: customTheme.colors.text.primary }}
        >
          Admin Configuration
        </Typography>
        {activeTab === 1 && (
          <Button
            variant="contained"
            onClick={() => handleOpen()}
            disabled={activeTab === 0} // Disable "Add" for Users
            sx={{
              backgroundColor: customTheme.colors.primary,
              textTransform: "none",
              borderRadius: customTheme.borderRadius.medium,
              padding: "10px 24px",
              fontWeight: 500,
              boxShadow: customTheme.shadows.small,
            }}
          >
            + {activeTab === 0 ? "" : "Department"}
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper
        sx={{
          mb: 3,
          borderRadius: customTheme.borderRadius.medium,
          backgroundColor: customTheme.colors.surface,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              color: customTheme.colors.text.secondary,
            },
            "& .Mui-selected": { color: customTheme.colors.primary },
            "& .MuiTabs-indicator": {
              backgroundColor: customTheme.colors.primary,
              height: 3,
            },
          }}
        >
          <Tab label="Account Management" />
          <Tab label="Departments" />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper
        sx={{
          overflowX: "auto",
          borderRadius: customTheme.borderRadius.large,
          backgroundColor: customTheme.colors.surface,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: customTheme.colors.lightGray }}>
              {activeTab === 0 ? (
                <>
                  <TableCell
                    sx={{
                      color: customTheme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    User
                  </TableCell>
                  <TableCell
                    sx={{
                      color: customTheme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      color: customTheme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Role
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell
                    sx={{
                      color: customTheme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Department Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: customTheme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Description
                  </TableCell>
                </>
              )}
              <TableCell
                align="right"
                sx={{ color: customTheme.colors.text.primary, fontWeight: 600 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={activeTab === 0 ? 4 : 3} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={activeTab === 0 ? 4 : 3}
                  align="center"
                  sx={{ color: customTheme.colors.text.secondary }}
                >
                  No {currentType.toLowerCase()}s found
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: `${customTheme.colors.lightGray}22`,
                    },
                  }}
                >
                  {activeTab === 0 ? (
                    <>
                      <TableCell
                        sx={{
                          color: customTheme.colors.text.primary,
                          fontWeight: 500,
                        }}
                      >
                        {item.username}
                      </TableCell>
                      <TableCell
                        sx={{ color: customTheme.colors.text.primary }}
                      >
                        {item.email}
                      </TableCell>
                      <TableCell
                        sx={{ color: customTheme.colors.primaryLight }}
                      >
                        {item.role}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell
                        sx={{ color: customTheme.colors.text.primary }}
                      >
                        {item.departmentName}
                      </TableCell>
                      <TableCell
                        sx={{ color: customTheme.colors.text.secondary }}
                      >
                        {item.description || "-"}
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(item)} size="small">
                      <Edit size={18} color={customTheme.colors.primary} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            backgroundColor: customTheme.colors.surface,
            color: customTheme.colors.text.primary,
          },
        }}
      >
        <DialogTitle>
          {formData.id
            ? `Edit ${currentType}`
            : activeTab === 0
            ? "Edit User Details"
            : "Create New Department"}
        </DialogTitle>
        <DialogContent dividers>
          {activeTab === 0 ? (
            <>
              <TextField
                autoFocus
                fullWidth
                label="Username"
                value={formData.username}
                required
                margin="normal"
                 sx={{
                  "& .MuiInputLabel-root": {
                    color: customTheme.colors.text.secondary,
                  },
                  "& .MuiOutlinedInput-root": {
                    color: customTheme.colors.text.primary,
                    "& fieldset": { borderColor: customTheme.colors.lightGray },
                    "&:hover fieldset": { borderColor: customTheme.colors.mediumGray },
                    "&.Mui-focused fieldset": {
                      borderColor: customTheme.colors.primary,
                      borderWidth: "2px",
                    },
                  },
                }}
              />
              <TextField
                autoFocus
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                margin="normal"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    color: customTheme.colors.text.secondary,
                  },
                  "& .MuiOutlinedInput-root": {
                    color: customTheme.colors.text.primary,
                    "& fieldset": { borderColor: customTheme.colors.lightGray },
                    "&:hover fieldset": { borderColor: customTheme.colors.mediumGray },
                    "&.Mui-focused fieldset": {
                      borderColor: customTheme.colors.primary,
                      borderWidth: "2px",
                    },
                  },
                }}
              />
            </>
          ) : (
            <>
              <TextField
                autoFocus
                fullWidth
                label="Department Name"
                value={formData.departmentName}
                onChange={(e) =>
                  setFormData({ ...formData, departmentName: e.target.value })
                }
                margin="normal"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    color: customTheme.colors.text.secondary,
                  },
                  "& .MuiOutlinedInput-root": {
                    color: customTheme.colors.text.primary,
                    "& fieldset": { borderColor: customTheme.colors.lightGray },
                    "&:hover fieldset": { borderColor: customTheme.colors.mediumGray },
                    "&.Mui-focused fieldset": {
                      borderColor: customTheme.colors.primary,
                      borderWidth: "2px",
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                required
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                margin="normal"
                multiline
                rows={3}
                sx={{
                  "& .MuiInputLabel-root": {
                    color: customTheme.colors.text.secondary,
                  },
                  "& .MuiOutlinedInput-root": {
                    color: customTheme.colors.text.primary,
                    "& fieldset": { borderColor: customTheme.colors.lightGray },
                    "&:hover fieldset": { borderColor: customTheme.colors.mediumGray },
                    "&.Mui-focused fieldset": {
                      borderColor: customTheme.colors.primary,
                      borderWidth: "2px",
                    },
                  },
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button type="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ backgroundColor: customTheme.colors.primary }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Alert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        severity={alertSeverity}
        message={alertMessage}
      />
    </div>
  );
}
