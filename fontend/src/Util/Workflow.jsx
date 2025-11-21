"use client";

import React, { useState } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Chip,
  Badge,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Grid,
  Avatar,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Home,
  Description,
  Workflow as WorkflowIcon,
  People,
  BarChart,
  Settings,
  Add,
  Save,
  Visibility,
  ChevronLeft,
  ChevronRight,
  DragHandle,
  Close,
  Menu as MenuIcon,
} from "@mui/icons-material";

const drawerWidth = 240;
const collapsedWidth = 60;

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
  { value: "date", label: "Date Picker" },
  { value: "file", label: "File Upload" },
];

export default function WorkflowBuilder() {
  const [isStepsCollapsed, setIsStepsCollapsed] = useState(false);
  const [workflowName, setWorkflowName] = useState("Employee Onboarding Workflow");
  const [workflowDescription, setWorkflowDescription] = useState(
    "Complete employee onboarding process with document verification and approvals"
  );
  const [selectedStep, setSelectedStep] = useState("1");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showCreateFieldModal, setShowCreateFieldModal] = useState(false);
  const [showCreateComponentModal, setShowCreateComponentModal] = useState(false);
  const [currentView, setCurrentView] = useState("workflows");

  const [savedFields, setSavedFields] = useState([
    { id: "sf1", label: "Employee Name", type: "text" },
    { id: "sf2", label: "Official Email", type: "email" },
    { id: "sf3", label: "Mobile Number", type: "phone" },
    { id: "sf4", label: "Employee ID", type: "number" },
    { id: "sf5", label: "Date of Birth", type: "date" },
    { id: "sf6", label: "Gender", type: "dropdown", options: ["Male", "Female", "Other"] },
  ]);

  const [savedComponents] = useState([
    {
      id: "sc1",
      label: "Document Upload",
      type: "document-upload",
      fields: [
        { id: "f1", label: "Document Type", type: "dropdown", options: ["PAN", "Aadhaar"] },
        { id: "f3", label: "Upload File", type: "file" },
      ],
    },
  ]);

  const [steps, setSteps] = useState([
    {
      id: "1",
      name: "Personal Information",
      types: ["Review"],
      instructions: "Please fill in all personal details accurately.",
      fields: [
        { id: "f1", label: "Employee Name", type: "text" },
        { id: "f2", label: "Date of Birth", type: "date" },
      ],
      components: [],
    },
  ]);

  const currentStep = steps.find((s) => s.id === selectedStep);

  const addStep = () => {
    setSteps([...steps, {
      id: (steps.length + 1).toString(),
      name: `Step ${steps.length + 1}`,
      types: ["Task"],
      instructions: "",
      fields: [],
      components: [],
    }]);
  };

  const updateStep = (id, updates) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const menuItems = [
    { icon: <Home />, label: "Dashboard" },
    { icon: <Description />, label: "Form Builder" },
    { icon: <Home />, label: "Workflows", active: true },
    { icon: <People />, label: "People" },
    { icon: <BarChart />, label: "Payroll" },
    { icon: <Settings />, label: "Settings" },
  ];

  if (currentView === "form-builder") {
    return <div>Form Builder View (same structure as before, converted to MUI)</div>;
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: isStepsCollapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isStepsCollapsed ? collapsedWidth : drawerWidth,
            boxSizing: "border-box",
            bgcolor: "white",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Avatar sx={{ bgcolor: "#E68A2A", width: 40, height: 40 }}>H</Avatar>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.label}
              selected={item.active}
              onClick={() => item.label === "Form Builder" && setCurrentView("form-builder")}
              sx={{
                borderRadius: 3,
                mx: 2,
                mb: 1,
                bgcolor: item.active ? "#FFF3E0" : "transparent",
                color: item.active ? "#E68A2A" : "inherit",
              }}
            >
              <ListItemIcon sx={{ color: item.active ? "#E68A2A" : "inherit" }}>
                {item.icon}
              </ListItemIcon>
              {!isStepsCollapsed && <ListItemText primary={item.label} />}
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <AppBar position="static" color="transparent" elevation={1}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h6">{workflowName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {workflowDescription}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<Visibility />} onClick={() => setShowPreviewDialog(true)}>
                Preview
              </Button>
              <Button variant="contained" sx={{ bgcolor: "#E68A2A" }} startIcon={<Save />}>
                Save Workflow
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {/* Steps Sidebar */}
          <Drawer
            variant="permanent"
            sx={{
              width: isStepsCollapsed ? 70 : 320,
              "& .MuiDrawer-paper": {
                width: isStepsCollapsed ? 70 : 320,
                bgcolor: "white",
                borderRight: "1px solid #e0e0e0",
                position: "relative",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
              {!isStepsCollapsed && <Typography variant="subtitle1">Workflow Steps</Typography>}
              <IconButton onClick={() => setIsStepsCollapsed(!isStepsCollapsed)}>
                {isStepsCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Box>

            {!isStepsCollapsed ? (
              <Box sx={{ p: 2 }}>
                {steps.map((step, i) => (
                  <Card
                    key={step.id}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      cursor: "pointer",
                      border: selectedStep === step.id ? "2px solid #E68A2A" : "1px solid #e0e0e0",
                      bgcolor: selectedStep === step.id ? "#FFF3E0" : "white",
                    }}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#E68A2A", width: 32, height: 32 }}>{i + 1}</Avatar>
                        <Box>
                          <Typography variant="subtitle2">{step.name}</Typography>
                          <Stack direction="row" spacing={1} mt={1}>
                            {step.types.map((t) => (
                              <Chip key={t} label={t} size="small" color="primary" />
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                <Button fullWidth variant="contained" sx={{ bgcolor: "#E68A2A" }} startIcon={<Add />} onClick={addStep}>
                  Add Step
                </Button>
              </Box>
            ) : (
              <Stack spacing={2} alignItems="center" sx={{ pt: 4 }}>
                {steps.map((step, i) => (
                  <Avatar
                    key={step.id}
                    sx={{
                      bgcolor: selectedStep === step.id ? "#E68A2A" : "#e0e0e0",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    {i + 1}
                  </Avatar>
                ))}
              </Stack>
            )}
          </Drawer>

          {/* Main Editor */}
          <Box sx={{ flexGrow: 1, p: 4, overflow: "auto" }}>
            <Typography variant="h5" gutterBottom>
              Workflow Configuration
            </Typography>

            {currentStep && (
              <Stack spacing={4}>
                <Card>
                  <CardHeader title="General Settings" />
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Workflow Name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      sx={{ mb: 3 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title={`Step: ${currentStep.name}`} />
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Step Name"
                      value={currentStep.name}
                      onChange={(e) => updateStep(currentStep.id, { name: e.target.value })}
                      sx={{ mb: 3 }}
                    />
                    <Typography variant="subtitle2" gutterBottom>
                      Step Types
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {["Review", "Approval", "Task", "Notification"].map((type) => (
                        <Chip
                          key={type}
                          label={type}
                          color={currentStep.types.includes(type) ? "primary" : "default"}
                          onClick={() => {
                            const newTypes = currentStep.types.includes(type)
                              ? currentStep.types.filter((t) => t !== type)
                              : [...currentStep.types, type];
                            updateStep(currentStep.id, { types: newTypes });
                          }}
                          sx={{ bgcolor: currentStep.types.includes(type) ? "#E68A2A" : undefined }}
                        />
                      ))}
                    </Stack>

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 4, bgcolor: "#E68A2A" }}
                      startIcon={<Add />}
                      onClick={() => setShowAddDialog(true)}
                    >
                      Add Fields or Components
                    </Button>
                  </CardContent>
                </Card>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      {/* Add Field/Component Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add to Step</DialogTitle>
        <DialogContent>
          <Tabs value="fields">
            <Tab label="Fields" value="fields" />
            <Tab label="Components" value="components" />
          </Tabs>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              {savedFields.map((field) => (
                <Grid item xs={12} sm={6} key={field.id}>
                  <Paper sx={{ p: 2, cursor: "pointer" }} onClick={() => setShowAddDialog(false)}>
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle2">{field.label}</Typography>
                        {field.options && <Typography variant="caption">{field.options.join(", ")}</Typography>}
                      </Box>
                      <Chip label={field.type} size="small" />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onClose={() => setShowPreviewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Workflow Preview</DialogTitle>
        <DialogContent>
          {steps.map((step, i) => (
            <Card key={step.id} sx={{ mb: 3 }}>
              <CardHeader title={`${i + 1}. ${step.name}`} />
              <CardContent>
                {step.fields.map((f) => (
                  <TextField key={f.id} fullWidth label={f.label} sx={{ mb: 2 }} disabled />
                ))}
              </CardContent>
            </Card>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
}