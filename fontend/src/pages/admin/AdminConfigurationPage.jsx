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
import { Edit, Delete } from "@mui/icons-material";
import { theme as customTheme } from "../../theme/theme";
import Button from "../../components/common/Button";

// Dummy API calls
const DesignationAPI = {
  getAll: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      designations: [
        {
          id: 1,
          name: "Software Engineer",
          description: "Develops software applications",
          createdAt: "2024-01-15",
        },
        {
          id: 2,
          name: "Senior Developer",
          description: "Leads development teams",
          createdAt: "2024-01-20",
        },
        {
          id: 3,
          name: "Project Manager",
          description: "Manages project timelines",
          createdAt: "2024-02-10",
        },
      ],
    };
  },
  create: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Creating designation:", data);
    return { id: Date.now(), ...data };
  },
  update: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Updating designation:", id, data);
    return { id, ...data };
  },
  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Deleting designation:", id);
    return { success: true };
  },
};

const DepartmentAPI = {
  getAll: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      departments: [
        {
          id: 1,
          name: "Engineering",
          description: "Software development team",
          createdAt: "2024-01-10",
        },
        {
          id: 2,
          name: "Human Resources",
          description: "HR and recruitment",
          createdAt: "2024-01-12",
        },
        {
          id: 3,
          name: "Marketing",
          description: "Brand and marketing team",
          createdAt: "2024-02-05",
        },
      ],
    };
  },
  create: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Creating department:", data);
    return { id: Date.now(), ...data };
  },
  update: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Updating department:", id, data);
    return { id, ...data };
  },
  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Deleting department:", id);
    return { success: true };
  },
};

export default function AdminConfig() {
  const [activeTab, setActiveTab] = useState(0);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const data = await DesignationAPI.getAll();
      setDesignations(data.designations);
    } catch (error) {
      console.error("Error fetching designations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await DepartmentAPI.getAll();
      setDepartments(data.departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpen = (item = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        id: null,
        name: "",
        description: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const isDesignation = activeTab === 0;
    const API = isDesignation ? DesignationAPI : DepartmentAPI;

    try {
      setLoading(true);
      if (formData.id) {
        await API.update(formData.id, {
          name: formData.name,
          description: formData.description,
        });
      } else {
        await API.create({
          name: formData.name,
          description: formData.description,
        });
      }

      if (isDesignation) {
        fetchDesignations();
      } else {
        fetchDepartments();
      }

      setOpen(false);
      setFormData({ id: null, name: "", description: "" });
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;

    const isDesignation = activeTab === 0;
    const API = isDesignation ? DesignationAPI : DepartmentAPI;

    try {
      setLoading(true);
      await API.delete(deleteItem.id);

      if (isDesignation) {
        fetchDesignations();
      } else {
        fetchDepartments();
      }

      setDeleteConfirmOpen(false);
      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
    setDeleteConfirmOpen(true);
  };

  const currentData = activeTab === 0 ? designations : departments;
  const currentType = activeTab === 0 ? "Designation" : "Department";

  return (
    <div>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <h1
          style={{
            fontSize: window.innerWidth < 640 ? "24px" : "32px",
            fontWeight: 700,
            color: customTheme.colors.text.primary,
            margin: 0,
          }}
        >
          {currentType}s
        </h1>

        <Button
          variant="contained"
          onClick={() => handleOpen()}
          sx={{
            backgroundColor: customTheme.colors.primary,
            textTransform: "none",
            borderRadius: customTheme.borderRadius.medium,
            padding: "10px 20px",
            fontWeight: 500,
            boxShadow: customTheme.shadows.small,
            "&:hover": {
              boxShadow: customTheme.shadows.medium,
            },
          }}
        >
          + New {currentType}
        </Button>
      </Box>

      {/* Tabs */}
      <Paper
        sx={{
          marginBottom: "20px",
          borderRadius: customTheme.borderRadius.large,
          boxShadow: customTheme.shadows.medium,
          backgroundColor: customTheme.colors.surface,
          //borderBottom: `4px solid ${customTheme.colors.primaryLight}`, // ✅ thicker bottom border
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "16px",
              minHeight: "60px",
              borderRadius: customTheme.borderRadius.medium,
              transition: "all 0.3s ease",
              color: customTheme.colors.text.secondary, // ✅ default (inactive) color
            },
            "& .MuiTab-root:hover": {
              backgroundColor: `${customTheme.colors.primaryLight}22`,
            },
            "& .Mui-selected": {
              color: customTheme.colors.primary, // ✅ only active tab turns primary
              backgroundColor: `${customTheme.colors.primaryLight}34`, // ✅ light highlight background
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: customTheme.colors.primary,
              height: "4px",
              borderRadius: "4px",
            },
          }}
        >
          <Tab label="Designations" />
          <Tab label="Departments" />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper
        sx={{
          overflowX: "auto",
          borderRadius: customTheme.borderRadius.large,
          boxShadow: customTheme.shadows.medium,
          backgroundColor: customTheme.colors.surface,
        }}
      >
        <Table sx={{ minWidth: 300 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: customTheme.colors.gray }}>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell align="right">
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography sx={{ py: 3 }}>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography
                    sx={{ py: 3, color: customTheme.colors.text.secondary }}
                  >
                    No {currentType.toLowerCase()}s found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{
                    "&:hover": { backgroundColor: customTheme.colors.gray },
                    transition: customTheme.transitions.fast,
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        onClick={() => handleOpen(item)}
                        size="small"
                        sx={{
                          color: customTheme.colors.primary,
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(item)}
                        size="small"
                        sx={{
                          color: customTheme.colors.error,
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 2, pt: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            {formData.id ? `Edit ${currentType}` : `Create New ${currentType}`}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <TextField
            fullWidth
            label={`${currentType} Name`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
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
            variant="outlined"
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpen(false);
              setFormData({ id: null, name: "", description: "" });
            }}
            type="secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              ml: 2,
              backgroundColor: customTheme.colors.primary,
            }}
            onClick={handleSave}
            disabled={!formData.name.trim() || loading}
          >
            {loading ? "Saving..." : `Save ${currentType}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteItem(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{deleteItem?.name}</b>? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setDeleteItem(null);
            }}
            type="secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: customTheme.colors.error,
            }}
            onClick={handleDeleteConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
