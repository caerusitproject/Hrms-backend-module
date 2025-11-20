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
  DialogContentText,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button as MuiButton,
} from "@mui/material";
import { Edit, Trash2 } from "lucide-react";
import { theme as customTheme } from "../../theme/theme";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";
import { ConfigApi as AdminApi } from "../../api/adminApi";

const roleOptions = [
  { label: "Admin", value: 1 },
  { label: "HR", value: 2 },
  { label: "Manager", value: 3 },
  { label: "Employee", value: 4 },
];

export default function AdminConfig() {
  const [activeTab, setActiveTab] = useState(0); // 0: Account Management, 1: Departments, 2: Holidays
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    id: null,
    departmentName: "",
    description: "",
    username: "",
    email: "",
    date: "",
    title: "",
  });

  const [userForm, setUserForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    roleId: "",
  });

  // Holiday-specific form (reuses formData but we keep separate logic)
  const holidayForm = {
    date: formData.date,
    title: formData.title,
    id: formData.id,
  };

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 0) fetchUsers();
    if (activeTab === 1) fetchDepartments();
    if (activeTab === 2) fetchHolidays();
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

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const data = await AdminApi.getAllHolidays(); // New API call
      setHolidays(data);
    } catch (err) {
      showAlert("error", "Failed to load holidays");
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

  // Generic open edit/add dialog
  const handleOpenEdit = (item = null) => {
    if (item) {
      if (activeTab === 0) {
        setFormData({
          id: item.id,
          username: item.username,
          email: item.email,
          departmentName: "",
          description: "",
          date: "",
          title: "",
        });
      } else if (activeTab === 1) {
        setFormData({
          id: item.id,
          departmentName: item.departmentName,
          description: item.description || "",
          username: "",
          email: "",
          date: "",
          title: "",
        });
      } else if (activeTab === 2) {
        setFormData({
          id: item.id,
          date: item.date.split("T")[0], // Format YYYY-MM-DD for input
          title: item.title,
          departmentName: "",
          description: "",
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
        date: "",
        title: "",
      });
    }
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setFormData({
      id: null,
      departmentName: "",
      description: "",
      username: "",
      email: "",
      date: "",
      title: "",
    });
  };

  // Save logic per tab
  const handleSave = async () => {
    try {
      if (activeTab === 0) {
        // Update user email
        if (!formData.email.trim())
          return showAlert("error", "Email is required");
        await AdminApi.updateUserEmail({
          id: formData.id,
          email: formData.email,
          username: formData.username,
        });
        showAlert("success", "User updated successfully");
        fetchUsers();
      } else if (activeTab === 1) {
        // Department
        if (!formData.departmentName.trim())
          return showAlert("error", "Department name is required");
        const payload = {
          departmentName: formData.departmentName,
          description: formData.description,
        };
        if (formData.id) {
          await AdminApi.updateDepartment(formData.id, payload);
          showAlert("success", "Department updated");
        } else {
          await AdminApi.createDepartment(payload);
          showAlert("success", "Department created");
        }
        fetchDepartments();
      } else if (activeTab === 2) {
        // Holiday
        if (!formData.date || !formData.title.trim()) {
          return showAlert("error", "Date and title are required");
        }
        let payload = {
          date: formData.date,
          title: formData.title,
        };

        if (formData.id) {
          // Inject id into payload only for update
          payload = { ...payload, id: formData.id };

          await AdminApi.updateHoliday(payload);
          showAlert("success", "Holiday updated successfully");
        } else {
          await AdminApi.createHoliday(payload);
          showAlert("success", "Holiday created successfully");
        }

        fetchHolidays();
      }
    } catch (err) {
      showAlert("error", "Operation failed");
    } finally {
      handleCloseEdit();
    }
  };

  // Add User Save
  const handleUserSave = async () => {
    const { fullname, username, email, password, roleId } = userForm;
    if (!fullname || !username || !email || !password || !roleId) {
      showAlert("error", "All fields are mandatory");
      return;
    }
    try {
      await AdminApi.createUser({
        fullname,
        username,
        email,
        password,
        roleId,
      });
      showAlert("success", "User created successfully");
      setAddUserOpen(false);
      setUserForm({
        fullname: "",
        username: "",
        email: "",
        password: "",
        roleId: "",
      });
      fetchUsers();
    } catch (err) {
      showAlert("error", "Failed to create user");
    }
  };

  // Delete Holiday
  const handleDeleteClick = (holiday) => {
    setItemToDelete(holiday);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;
    try {
      await AdminApi.deleteHoliday(itemToDelete.id);
      showAlert("success", "Holiday deleted successfully");
      fetchHolidays();
    } catch (err) {
      showAlert("error", "Failed to delete holiday");
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Dynamic data and headers
  const currentData =
    activeTab === 0 ? users : activeTab === 1 ? departments : holidays;

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
          {["Account", "Departments", "Holidays"][activeTab]} Management
        </Typography>

        {(activeTab === 1 || activeTab === 2) && (
          <Button
            variant="contained"
            onClick={() => handleOpenEdit()}
            sx={{
              backgroundColor: customTheme.colors.primary,
              textTransform: "none",
              borderRadius: customTheme.borderRadius.medium,
              padding: "10px 24px",
              fontWeight: 500,
              boxShadow: customTheme.shadows.small,
            }}
          >
            + {activeTab === 2 ? "Holiday" : "Department"}
          </Button>
        )}

        {activeTab === 0 && (
          <Button
            variant="contained"
            onClick={() => setAddUserOpen(true)}
            sx={{
              backgroundColor: customTheme.colors.primary,
              textTransform: "none",
              borderRadius: customTheme.borderRadius.medium,
              padding: "10px 24px",
              fontWeight: 500,
              boxShadow: customTheme.shadows.small,
            }}
          >
            + Add User
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
          <Tab label="Holidays" />
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
              {activeTab === 0 && (
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
              )}
              {activeTab === 1 && (
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
              {activeTab === 2 && (
                <>
                  <TableCell
                    sx={{
                      color: customTheme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: customTheme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Title
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
                  No{" "}
                  {activeTab === 0
                    ? "users"
                    : activeTab === 1
                    ? "departments"
                    : "holidays"}{" "}
                  found
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
                  {activeTab === 0 && (
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
                  )}
                  {activeTab === 1 && (
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
                  {activeTab === 2 && (
                    <>
                      <TableCell
                        sx={{ color: customTheme.colors.text.primary }}
                      >
                        {new Date(item.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        sx={{ color: customTheme.colors.text.primary }}
                      >
                        {item.title}
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenEdit(item)}
                      size="small"
                    >
                      <Edit size={18} color={customTheme.colors.primary} />
                    </IconButton>
                    {activeTab === 2 && (
                      <IconButton
                        onClick={() => handleDeleteClick(item)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <Trash2
                          size={18}
                          color={customTheme.colors.error || "#d32f2f"}
                        />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Unified Edit/Add Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
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
            ? `Edit ${
                activeTab === 2
                  ? "Holiday"
                  : activeTab === 1
                  ? "Department"
                  : "User"
              }`
            : `Add New ${activeTab === 2 ? "Holiday" : "Department"}`}
        </DialogTitle>
        <DialogContent dividers>
          {activeTab === 0 && (
            <>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                margin="normal"
                required
              />
            </>
          )}
          {activeTab === 1 && (
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
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                margin="normal"
                multiline
                rows={3}
              />
            </>
          )}
          {activeTab === 2 && (
            <>
              <TextField
                autoFocus
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                margin="normal"
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button type="secondary" onClick={handleCloseEdit}>
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

      {/* Add User Dialog (unchanged) */}
      <Dialog
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { backgroundColor: customTheme.colors.surface } }}
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Full Name"
            required
            value={userForm.fullname}
            onChange={(e) =>
              setUserForm({ ...userForm, fullname: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Username"
            required
            value={userForm.username}
            onChange={(e) =>
              setUserForm({ ...userForm, username: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            required
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            required
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
            margin="normal"
          />
          <FormControl fullWidth required margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={userForm.roleId}
              label="Role"
              onChange={(e) =>
                setUserForm({ ...userForm, roleId: e.target.value })
              }
            >
              {roleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button type="secondary" onClick={() => setAddUserOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: customTheme.colors.primary }}
            onClick={handleUserSave}
          >
            Save User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Holiday</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the holiday "{itemToDelete?.title}"
            on{" "}
            {itemToDelete?.date &&
              new Date(itemToDelete.date).toLocaleDateString()}
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="secondary" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={confirmDelete}
            color="error"
            variant="contained"
          >
            Delete
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
